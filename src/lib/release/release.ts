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

  log(`RUN`, `Fetching git info release`)
  exec('git fetch --all', { stdio: 'pipe' })

  const releaseResult = await runReleaseIt({
    dryRun: config.dryRun,
    pkgFiles: [join(config.cwd, 'package.json'), ...packages.pkgFiles],
    preRelease: config.preRelease,
    version: config.version,
  })

  if (!releaseResult) {
    error("Something went wrong running 'release-it' :( ")
    process.exit(1)
  }

  const publishResult = runNpmPublish({
    dryRun: config.dryRun,
    pkgFiles: packages.pkgFiles,
    version: config.version,
    tag: config.npmTag,
  })

  if (!publishResult) {
    error("Something went wrong running 'npm publish' :( ")
    process.exit(1)
  }

  if (releaseResult || publishResult) {
    log(`SUCCESS`, `It looks like we're all done here! :)`)
  }
}
