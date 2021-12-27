import { join } from 'path'
import { error, exec, log, runNpmPublish, runReleaseIt } from '../../utils'
import { ReleaseConfig } from './interfaces/release-config'
import { validateConfig, validatePackages, validateWorkspace } from './release-validate'

export const release = async (_config: ReleaseConfig): Promise<void> => {
  // Validate the config and read required files
  const config = validateConfig(_config)

  if (config === false) {
    error('Error validating configuration')
    process.exit(1)
  }

  const workspace = validateWorkspace(config)

  if (workspace === false) {
    error('Error validating workspace')
    process.exit(1)
  }

  const packages = validatePackages(config, workspace)

  if (packages === false) {
    error('Error validating packages')
    process.exit(1)
  }

  log('RUN', 'Fetching git info release')
  exec('git fetch --all', { stdio: 'pipe' })

  if (config.local) {
    log('DRY-RUN', 'Skipping GitHub release')
  } else {
    const releaseResult = await runReleaseIt({
      dryRun: config.dryRun,
      pkgFiles: [join(config.cwd, 'package.json'), ...packages.pkgFiles],
      preRelease: config.preRelease,
      version: config.version,
      ci: config.ci,
    })

    if (!releaseResult) {
      error("Something went wrong running 'release-it' :( ")
      process.exit(1)
    }
  }

  if (config.dryRun) {
    log('DRY-RUN', 'Skipping npm publish')
  } else {
    const publishResult = runNpmPublish({
      dryRun: config.dryRun,
      local: config.local,
      localUrl: config.localUrl,
      pkgFiles: packages.pkgFiles,
      version: config.version,
      tag: config.npmTag,
    })

    if (!publishResult) {
      error("Something went wrong running 'npm publish' :( ")
      process.exit(1)
    }

    if (publishResult) {
      log('SUCCESS', "It looks like we're all done here! :)")
    }
  }
}
