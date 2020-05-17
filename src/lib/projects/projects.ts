import { readJSONSync } from 'fs-extra'
import * as inquirer from 'inquirer'
import { join } from 'path'
import { err, exec, getWorkspaceInfo, gray, log, selectFromList, WorkspaceInfo } from '../../utils'
import { BaseConfig } from '../release/interfaces/release-config'

export const BACK_OPTION = '[ BACK ]'
export const EXIT_OPTION = '[ EXIT ]'
export const setType = (type: string) => {
  switch (type) {
    case 'boolean':
      return 'confirm'
    default:
      return 'input'
  }
}
export const getSchematicParams = (cwd: string, param: string): Promise<any | false> => {
  try {
    const [pkg, schematic] = param.split(':')
    const pkgRootPath = join(cwd, 'node_modules', pkg)

    // Get schematics property form {cwd}/node_modules/{pkg}/package.json
    const pkgJsonPath = join(pkgRootPath, 'package.json')
    const pkgJson = readJSONSync(pkgJsonPath)
    if (!pkgJson) {
      return Promise.reject(new Error(`Package ${pkg} not found`))
    }
    if (!pkgJson.schematics) {
      return Promise.reject(new Error(`Package ${pkg} does not have schematics`))
    }

    // Get collection.json defined in schematics
    const collectionPath = join(pkgRootPath, pkgJson.schematics)
    const collection = readJSONSync(collectionPath)
    if (!collection || !collection.schematics) {
      return Promise.reject(new Error(`Collections for ${pkg} not found`))
    }
    if (!collection.schematics[schematic]) {
      return Promise.reject(new Error(`Collection in ${pkg} does not have schematic ${schematic}`))
    }

    // Get schema.json from selected schematic
    const schematicDef = collection.schematics[schematic]
    if (!schematicDef.schema) {
      return Promise.resolve({})
    }
    const schemaPath = join(pkgRootPath, schematicDef.schema)
    const schema = readJSONSync(schemaPath)

    if (!schema || !schema.properties) {
      return Promise.reject(new Error(`Properties for ${pkg}:${schematic} not found`))
    }

    const schemaProperties = schema.properties
    const properties = [
      ...Object.keys(schemaProperties).map((property) => ({
        name: property,
        type: setType(schemaProperties[property].type),
        message: schemaProperties[property]?.description,
        default: schemaProperties[property]?.default,
      })),
      {
        name: 'dryRun',
        type: 'confirm',
        message: 'Do you want to do a dry-run?',
        default: true,
      },
    ]
    // console.log('properties', schemaProperties)
    return Promise.resolve({ properties })
  } catch (error) {
    err(error)
    return Promise.reject(error)
  }
}

const selectProject = async (
  info: WorkspaceInfo,
): Promise<{ projectName: string; projectType: string; project: any } | false> => {
  const items: any = info.workspace?.projects || []
  if (Object.keys(items).length === 0) {
    err("Can't find any projects in this workspace")
    return Promise.resolve(false)
  }

  const projectList = Object.keys(items).map((item: string) => ({
    projectName: item,
    type: items[item].projectType,
  }))
  const apps: string[] = projectList
    .filter((t: any) => t.type === 'application')
    .map((t: any) => t.projectName)
    .sort()
  const libs: string[] = projectList
    .filter((t: any) => t.type === 'library')
    .map((t: any) => t.projectName)
    .sort()

  const options = []
  if (apps.length !== 0) {
    options.push(new inquirer.Separator('Apps'), ...apps)
  }
  if (libs.length !== 0) {
    options.push(new inquirer.Separator('Libraries:'), ...libs)
  }
  const projectName = await selectFromList(options, {
    addExit: true,
    message: `Select project (${projectList.length} found)`,
  })

  if (projectName === false) {
    return Promise.resolve(false)
  }
  const project = info?.workspace?.projects[projectName]
  return { projectType: project.projectType, projectName, project }
}

const selectProjectAction = async (
  info: WorkspaceInfo,
  { projectName, project }: { projectName: string; project: any },
): Promise<{ action: string; payload: any } | false> => {
  const answers: any = { projectName }
  const architects = Object.keys(project?.architect).sort()
  const schematics = ['@nrwl/workspace:move', '@nrwl/workspace:remove']
  const projectOptions: any[] = [
    new inquirer.Separator('Builders'),
    ...architects,
    new inquirer.Separator('Schematics'),
    ...schematics,
  ]
  const response = await selectFromList(projectOptions, {
    addExit: true,
    message: `Selected ${project.projectType} ${projectName} ${gray(project.root)}`,
  })

  if (response === false) {
    return Promise.resolve(false)
  }
  if (architects.includes(response)) {
    return { action: 'exec', payload: `${info.cli} run ${projectName}:${response}` }
  }
  if (schematics.includes(response)) {
    const params = await getSchematicParams(info.cwd, response)
    const payload = [`${info.cli} generate ${response}`]
    if (Object.keys(params.properties).length !== 0) {
      Object.keys(answers).forEach((answer) => payload.push(` --${answer} ${answers[answer]}`))

      const res: any = await inquirer.prompt(
        params.properties.filter((p: any) => {
          return !Object.keys(answers).includes(p.name)
        }),
      )
      Object.keys(res).forEach((answer) => payload.push(` --${answer} ${res[answer]}`))
      // console.log(res)
    }

    return { action: 'exec', payload: payload.join(' ') }
  }
  return Promise.resolve(false)
}

export const interactive = async (info: WorkspaceInfo) => {
  const projectResult = await selectProject(info)

  if (projectResult === false) {
    return
  }

  const projectActionResult = await selectProjectAction(info, projectResult)

  if (projectActionResult === false) {
    return
  }
  if (projectActionResult.action === 'exec') {
    exec(projectActionResult.payload)
    exec(`yarn format`, { stdio: 'ignore' })
  } else {
    err(`Unknown action ${projectActionResult.action}`)
  }
}

export const projects = async (config: BaseConfig): Promise<void> => {
  log('Projects', gray(`Working directory ${config.cwd}`))
  const info = getWorkspaceInfo({ cwd: config.cwd })

  await interactive(info)
}
