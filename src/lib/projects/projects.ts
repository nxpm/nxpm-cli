import { readJSONSync } from 'fs-extra'
import * as inquirer from 'inquirer'
import { get } from 'lodash'
import { join } from 'path'
import {
  error,
  exec,
  getWorkspaceInfo,
  gray,
  log,
  selectFromList,
  WorkspaceInfo,
} from '../../utils'
import { BaseConfig } from '../../utils/base-config'

export const BACK_OPTION = '[ BACK ]'
export const EXIT_OPTION = '[ EXIT ]'
export const INSTALL_OPTION = '[ INSTALL ]'
export const REMOVE_OPTION = '[ REMOVE ]'
export const RUN_OPTION = '[ RUN ]'
export interface ProjectsConfig extends BaseConfig {
  cwd: string
}

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
        default: false,
      },
    ]

    return Promise.resolve({ properties })
  } catch (error) {
    error(error)
    return Promise.reject(error)
  }
}

const selectProjectName = async (info: WorkspaceInfo): Promise<string | false> => {
  const items: any = info.workspace?.projects || []
  if (Object.keys(items).length === 0) {
    error("Can't find any projects in this workspace")
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

  return projectName
}

const selectProjectAction = async (
  info: WorkspaceInfo,
  {
    target,
    params,
    projectName,
    project,
  }: { target?: string; params: { [key: string]: any }; projectName: string; project: any },
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
  if (!target) {
    const found = await selectFromList(projectOptions, {
      addExit: true,
      message: `Selected ${project.projectType} ${projectName} ${gray(project.root)}`,
    })
    if (!found) {
      error(`Action not found`)
      return Promise.resolve(false)
    }
    target = found
  }

  if (architects.includes(target)) {
    const architectParams = get(params, `${target}.params`, '')
    return {
      action: 'exec',
      payload: `${info.cli} run ${projectName}:${target} ${architectParams}`,
    }
  }
  if (schematics.includes(target)) {
    const params = await getSchematicParams(info.cwd, target)
    const payload = [`${info.cli} generate ${target}`]
    if (Object.keys(params.properties).length !== 0) {
      Object.keys(answers).forEach((answer) => payload.push(` --${answer} ${answers[answer]}`))

      const res: any = await inquirer.prompt(
        params.properties.filter((p: any) => {
          return !Object.keys(answers).includes(p.name)
        }),
      )
      Object.keys(res).forEach((answer) => payload.push(` --${answer} ${res[answer]}`))
    }

    return { action: 'exec', payload: payload.join(' ') }
  }
  return Promise.resolve(false)
}

export const interactive = async (
  info: WorkspaceInfo,
  config: ProjectsConfig,
  { projectName, target }: { projectName?: string; target?: string },
) => {
  if (!projectName) {
    const res = await selectProjectName(info)
    if (res) {
      projectName = res
    }
  }

  if (typeof projectName === 'undefined') {
    return
  }

  const project = info?.workspace?.projects[projectName]

  if (!project) {
    error(`Project ${projectName} not found`)
    return
  }

  const params = get(config?.userConfig, 'projects', {})
  const projectActionResult = await selectProjectAction(info, {
    target,
    projectName,
    project,
    params,
  })

  if (projectActionResult === false) {
    return
  }

  if (projectActionResult.action === 'exec') {
    exec(`${projectActionResult.payload}`)
    exec(`yarn format`, { stdio: 'ignore' })
  } else {
    error(`Unknown action ${projectActionResult.action}`)
  }
}
export const projects = async (
  config: ProjectsConfig,
  projectName?: string,
  target?: string,
): Promise<void> => {
  log('Projects', gray(`Working directory ${config.cwd}`))
  const info = getWorkspaceInfo({ cwd: config.cwd })

  await interactive(info, config, { projectName, target })
}
