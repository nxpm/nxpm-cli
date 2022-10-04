import { getProjects } from '@nrwl/devkit'
import { FsTree } from '@nrwl/tao/src/shared/tree'
import { existsSync, writeFileSync } from 'fs'
import { readJSONSync } from 'fs-extra'
import { join, relative, resolve } from 'path'
import {
  error,
  exec,
  getWorkspaceInfo,
  gray,
  log,
  NX_PACKAGE_BUILDERS,
  parseVersion,
  red,
  validatePackageJson,
  yellowBright,
} from '../../utils'

import { ReleaseConfig } from './interfaces/release-config'
import { ValidatedConfig } from './interfaces/validated-config'
import { ValidatedPackages } from './interfaces/validated-packages'
import { ValidatedWorkspace } from './interfaces/validated-workspace'

export function validateConfig(config: ReleaseConfig): ValidatedConfig | false {
  const info = getWorkspaceInfo({ cwd: config.cwd })
  const { isPrerelease } = parseVersion(config.version)
  const validated: ValidatedConfig = {
    ...config,
    nx: info.nx,
    npmScope: `@${info.nx.npmScope}`,
    npmTag: isPrerelease ? 'next' : 'latest',
    package: info.package,
    preRelease: isPrerelease,
    workspacePath: info.path,
    workspaceType: info.type,
    workspace: info.workspace,
  }

  if (!validated.version) {
    log(red('ERROR'), 'Please provide the release version (like: 1.2.3-beta.4)')
    return false
  }

  if (!parseVersion(config.version).isValid) {
    log(red('ERROR'), 'Please provide a valid release version (like: 1.2.3-beta.4)')
    return false
  }

  log(
    'VALIDATE',
    `Using ${yellowBright(validated.workspaceType)} workspace: ${gray(
      relative(config.cwd, validated.workspacePath),
    )}`,
  )
  return validated
}

export function validateWorkspace(config: ValidatedConfig): ValidatedWorkspace | false {
  const host = new FsTree(process.cwd(), true)
  const projects = getProjects(host)

  const libs = [...projects.keys()]
    .map((id) => ({ id, ...projects.get(id) }))
    .filter((project) => project.projectType === 'library')

  if (!libs.length) {
    throw new Error(`No libraries found in nx workspace ${config.workspacePath}`)
  }

  log('VALIDATE', `Found ${yellowBright(libs.length)} libraries:`)

  // Find libraries that have a package executor
  const packages = libs
    .map((lib) => ({
      lib,
      target: Object.keys(lib.targets)
        .map((id) => ({ id, ...lib.targets[id] }))
        // We only include targets that are called 'build'
        .filter((target) => target.id === 'build')
        .find(({ executor }) => NX_PACKAGE_BUILDERS.includes(executor)),
    }))
    // Only release packages which turned out to have at least one 'publishable' target
    .filter((lib) => !!lib.target)

  for (const pkg of packages) {
    log('VALIDATE', `Found executor for ${yellowBright(pkg.lib.id)}: ${gray(pkg.target.executor)} `)
  }

  return {
    packages,
  }
}

export function validatePackages(
  config: ValidatedConfig,
  workspace: ValidatedWorkspace,
): ValidatedPackages | false {
  // Validate libraries before packaging
  const invalid = workspace.packages.filter(({ lib }) => {
    const name = `${config.npmScope}/${lib.id}`
    return !validatePackageJson(lib.root, {
      dryRun: config.dryRun,
      fix: config.fix,
      version: config.version,
      name,
      workspacePkgJson: config.package,
    })
  })

  if (invalid.length) {
    const invalidIds = invalid.map((item) => item.lib.id)
    log(red('Could not continue because of errors in the following packages:'))
    console.log(invalidIds)
    if (!config.fix) {
      log('Try running this command with the --fix flag to fix some common problems')
    }
    return false
  }

  const pkgFiles: string[] = workspace.packages
    .map((pkg) => {
      if (!pkg.target?.options?.outputPath && !pkg.target?.options?.project) {
        console.log('pkg.target?.options', pkg.target?.options)
        throw new Error(`Error determining dist path for ${pkg.lib.id}`)
      }

      if (pkg.target?.options?.outputPath) {
        // @nrwl/node:package builder
        return pkg.target?.options?.outputPath
      }
      if (pkg?.target?.options?.project) {
        // @nrwl/angular:package builder
        const ngPackagePath = join(config.cwd, pkg?.target?.options?.project)
        const ngPackageJson = readJSONSync(ngPackagePath)
        return relative(config.cwd, resolve(pkg.lib.root, ngPackageJson.dest))
      }
      throw new Error("Can't find pkg file")
    })
    .map((file) => join(file, 'package.json'))

  if (config.build) {
    exec('yarn nx run-many --target build --all')
  }

  // Here we check of the expected packages are built
  const foundPkgFiles = pkgFiles.map((pkgFile) => {
    const pkgPath = join(config.cwd, pkgFile)
    const exists = existsSync(pkgPath)
    if (!exists) {
      error(`Could not find ${pkgFile}. Make sure to build your packages before releasing`)
      return false
    }

    const pkgJson = readJSONSync(pkgPath)
    writeFileSync(
      pkgPath,
      JSON.stringify(
        {
          ...pkgJson,
          version: config.version,
        },
        null,
        2,
      ),
    )

    return pkgFile
  })

  if (foundPkgFiles.length !== pkgFiles.length) {
    return false
  }

  if (!foundPkgFiles.length) {
      error('VALIDATE', 'Found no packages to release')
     return false
  }

  log('VALIDATE', `Found ${foundPkgFiles.length} packages to release`)

  return {
    pkgFiles,
  }
}
