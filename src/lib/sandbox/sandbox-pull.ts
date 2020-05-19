import { cli } from 'cli-ux'
import { error, log } from '../../utils'
import { SandboxPullConfig } from './interfaces/sandbox-pull-config'
import {
  getDockerImages,
  getSandboxUrlCache,
  pullDockerImage,
  removeDockerImage,
  sandboxUrlCache,
} from './utils/sandbox-utils'

const pull = async (config: SandboxPullConfig) => {
  const existing = await getDockerImages()
  const sandboxes = await getSandboxUrlCache(config)

  const filtered = config.remove ? sandboxes : sandboxes.filter((s) => !existing.includes(s.name))

  if (config.remove) {
    cli.action.start(`Remove ${filtered.length} Docker images ${config.force ? '(FORCED)' : null}`)
    for (let sandbox of filtered) {
      cli.action.status = sandbox.name
      try {
        await removeDockerImage(sandbox.name, config.force)
      } catch (e) {}
    }
    cli.action.stop()
  }

  if (filtered.length) {
    cli.action.start(`Pulling ${filtered.length} Docker images`)
    for (let sandbox of filtered) {
      cli.action.status = sandbox.name
      try {
        await pullDockerImage(sandbox.name)
      } catch (e) {
        error(e.message)
      }
    }
    cli.action.stop()
  } else {
    log('SANDBOX:PULL', 'Nothing to pull, you are all in sync!')
  }
}

export const sandboxPull = async (config: SandboxPullConfig): Promise<void> => {
  await sandboxUrlCache(config)
  await pull(config)
}
