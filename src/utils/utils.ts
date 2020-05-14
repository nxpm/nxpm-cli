import { execSync, ExecSyncOptions } from 'child_process'
import { existsSync } from 'fs'
import { readJSONSync, writeFileSync } from 'fs-extra'
import { dirname, join, relative } from 'path'

import * as releaseIt from 'release-it'

import { RELEASE_IT_PACKAGE_VERSION } from './constants'
import { error, gray, greenBright, log, red, yellowBright } from './logging'

export const exec = (command: string, options?: ExecSyncOptions): Buffer =>
  execSync(command, { stdio: [0, 1, 2], ...options })

export const run = (command: string) => {
  log('RUNNING', command)
  exec(command)
}

export const getPackageJson = (root: string): { [key: string]: any } | null => {
  const pkgPath = join(process.cwd(), root, 'package.json')
  if (!existsSync(pkgPath)) {
    log(red(`Could not find package.json in ${root}`))
    return null
  }
  return readJSONSync(pkgPath)
}

export const updatePackageJson = (root: string, obj: { [key: string]: any }): any => {
  const pkgPath = join(process.cwd(), root, 'package.json')
  const pkgJson = getPackageJson(root)
  writeFileSync(
    pkgPath,
    JSON.stringify(
      {
        ...pkgJson,
        ...obj,
      },
      null,
      2,
    ) + '\n',
  )
  return getPackageJson(root)
}

export const validatePackageJsonLicense = (
  root: string,
  { pkgJson, license }: { pkgJson: any; license: string },
): boolean => {
  // Verify that the name in package.json is correct
  if (!pkgJson.license) {
    log(red('ERROR'), `License not defined in in ${join(root, 'package.json')}`)
    return false
  }
  if (pkgJson.license !== license) {
    log(
      red('ERROR'),
      `License not valid in ${join(root, 'package.json')}, should be "${license}", not "${
        pkgJson.license
      }"`,
    )
    return false
  }
  return true
}

export const validatePackageJsonName = (
  root: string,
  { pkgJson, name }: { pkgJson: any; name: string },
): boolean => {
  // Verify that the name in package.json is correct
  if (pkgJson.name !== name) {
    log(
      red('ERROR'),
      `Name not valid in ${join(root, 'package.json')}, should be "${name}", not "${
        pkgJson.name
      }"  `,
    )
    return false
  }
  return true
}

export const validatePackageJsonVersion = (
  root: string,
  { pkgJson, version }: { pkgJson: any; version: string },
): boolean => {
  // Verify that the version is set correctly
  if (!pkgJson.version || pkgJson.version !== version) {
    log(
      red('ERROR'),
      `Version "${pkgJson.version}" should be "${version}" in ${join(root, 'package.json')} `,
    )
    return false
  }
  return true
}

export const updatePackageJsonLicense = (
  root: string,
  { license }: { license: string },
): boolean => {
  updatePackageJson(root, { license })

  log(greenBright('FIXED'), `License set to ${license} in ${join(root, 'package.json')}`)
  return validatePackageJsonLicense(root, { pkgJson: getPackageJson(root), license })
}

export const updatePackageJsonVersion = (
  root: string,
  { version }: { version: string },
): boolean => {
  updatePackageJson(root, { version })

  log(greenBright('FIXED'), `Version set to "${version}" in ${join(root, 'package.json')}`)
  return validatePackageJsonVersion(root, { pkgJson: getPackageJson(root), version })
}

export const updatePackageJsonName = (root: string, { name }: { name: string }): boolean => {
  updatePackageJson(root, { name })

  log(greenBright('FIXED'), `Name set to "${name}" in ${join(root, 'package.json')}`)
  return validatePackageJsonName(root, { pkgJson: getPackageJson(root), name })
}

export const validatePackageJson = (
  root: string,
  {
    dryRun = false,
    fix,
    name,
    workspacePkgJson,
  }: { dryRun: boolean; fix: boolean; name: string; workspacePkgJson: any },
): boolean => {
  // Read the libs package.json
  const pkgJson = getPackageJson(root)

  if (!pkgJson) {
    return false
  }

  let hasErrors = false

  // Verify that the version is set correctly
  if (!validatePackageJsonVersion(root, { pkgJson, version: RELEASE_IT_PACKAGE_VERSION })) {
    if (fix) {
      hasErrors = !updatePackageJsonVersion(root, { version: RELEASE_IT_PACKAGE_VERSION })
    } else {
      hasErrors = true
    }
  }

  if (!validatePackageJsonLicense(root, { pkgJson, license: workspacePkgJson.license })) {
    if (fix) {
      hasErrors = !updatePackageJsonLicense(root, { license: workspacePkgJson.license })
    } else {
      hasErrors = true
    }
  }

  if (!validatePackageJsonName(root, { pkgJson, name })) {
    if (fix) {
      hasErrors = !updatePackageJsonName(root, { name })
    } else {
      hasErrors = true
    }
  }

  if (!hasErrors) {
    log('VALIDATE', `Package ${yellowBright(name)} is valid.`)
  }
  return !hasErrors
}

export interface NpmPublishOptions {
  dryRun: boolean
  pkgFiles: string[]
  version: string
  tag: 'next' | 'latest'
}
export const runNpmPublish = ({ dryRun, pkgFiles, version, tag }: NpmPublishOptions): boolean => {
  let hasErrors = false
  for (const pkgFile of pkgFiles) {
    const filePath = relative(process.cwd(), pkgFile)
    // Skip the root package.json file
    if (filePath !== 'package.json') {
      const baseDir = dirname(filePath)
      const pkgInfo = readJSONSync(join(process.cwd(), pkgFile))
      const name = `${pkgInfo.name}@${version}`
      const command = `npm publish --tag ${tag} --access public --registry=https://registry.npmjs.org/`
      if (!dryRun) {
        try {
          exec(command, { cwd: baseDir })
        } catch (e) {
          error(`Failed to publish ${name} to npm:`)
          console.log(e)
          hasErrors = true
        }
      } else {
        log(`[dry-run]`, 'Skipping command', gray(command))
      }
    }
  }
  return !hasErrors
}

export interface ReleaseItOptions {
  dryRun: boolean
  pkgFiles: string[]
  preRelease: boolean
  version: string
}
export const runReleaseIt = ({
  dryRun = false,
  preRelease,
  version,
}: ReleaseItOptions): Promise<boolean> => {
  const options = {
    'dry-run': dryRun,
    changelogCommand: 'conventional-changelog -p angular | tail -n +3',
    /**
     * Needed so that we can leverage conventional-changelog to generate
     * the changelog
     */
    safeBump: false,
    /**
     * All the package.json files that will have their version updated
     * by release-it
     */
    increment: version,
    requireUpstream: false,
    github: {
      preRelease: preRelease,
      release: true,
      token: process.env.GITHUB_TOKEN,
    },
    npm: {
      /**
       * We don't use release-it to do the npm publish, because it is not
       * able to understand our multi-package setup.
       */
      release: false,
      publish: false,
    },
    git: {
      requireCleanWorkingDir: false,
    },
  }
  return releaseIt(options)
    .then(() => {
      return true
    })
    .catch((err: any) => {
      error(err.message)
      return false
    })
}
