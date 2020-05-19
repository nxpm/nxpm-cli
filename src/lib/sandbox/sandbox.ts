import * as inquirer from 'inquirer'
import { error, gray, log, selectFromList } from '../../utils'
import { BACK_OPTION, INSTALL_OPTION, REMOVE_OPTION, RUN_OPTION } from '../projects/projects'
import { Sandbox } from './interfaces/sandbox'
import { SandboxConfig } from './interfaces/sandbox-config'
import {
  getDockerImages,
  getSandboxUrlCache,
  pullDockerImage,
  removeDockerImage,
  runDockerImage,
  sandboxUrlCache,
} from './utils/sandbox-utils'

export interface NxPlugin {
  name: string
  description: string
  url: string
}

export const selectSandbox = async (
  sandboxes: any[],
  message: string,
): Promise<{ sandboxName: string } | false> => {
  const sandboxName = await selectFromList(sandboxes, { message, addExit: true })
  if (!sandboxName) {
    return false
  }
  return { sandboxName }
}
export const getConfigAction = (config: SandboxConfig) => {
  switch (config.action) {
    case 'run':
      return RUN_OPTION
  }
}

export const selectSandboxFlow = async (
  config: SandboxConfig,
  sandboxName?: string,
): Promise<{ selection: string; sandboxName: string; sandbox?: Sandbox } | false> => {
  const [sandboxes, images] = await Promise.all([getSandboxUrlCache(config), getDockerImages()])
  if (config.sandboxId) {
    sandboxName = sandboxes.find((sandbox) => sandbox.id === config.sandboxId)?.name
  }
  const availableSandboxes: any[] = sandboxes
    .map((s) => s.name)
    .filter((name) => !images.includes(name))
  const installedSandboxes: any[] = sandboxes
    .map((s) => s.name)
    .filter((name) => images.includes(name))

  const options: any[] = []
  if (!sandboxName) {
    console.clear()
    if (installedSandboxes.length !== 0) {
      options.push(new inquirer.Separator('Installed Sandboxes'), ...installedSandboxes.sort())
    }
    if (availableSandboxes.length !== 0) {
      options.push(new inquirer.Separator('Available Sandboxes'), ...availableSandboxes.sort())
    }
    const sandboxResult = await selectSandbox(options, 'Sandboxes')

    if (!sandboxResult) {
      return Promise.resolve(false)
    }
    sandboxName = sandboxResult.sandboxName
  }

  const sandbox = sandboxes.find((p: NxPlugin) => p.name === sandboxName)

  if (!sandbox) {
    error(`Plugin ${sandboxName} not found`)
    return Promise.resolve(false)
  }

  // eslint-disable-next-line no-console
  console.log(`
  ${sandbox.description}
  ${gray(sandbox.url)}
`)
  const isInstalled = installedSandboxes.includes(sandboxName)
  const availableOptions = [INSTALL_OPTION]
  const installedOptions = [RUN_OPTION, REMOVE_OPTION]

  const selection = config.action
    ? getConfigAction(config)
    : await selectFromList(isInstalled ? installedOptions : availableOptions, {
        addBack: true,
        addExit: true,
        message: sandboxName,
      })

  if (!selection) {
    return Promise.resolve(false)
  }

  return {
    selection,
    sandboxName,
    sandbox,
  }
}

const loop = async (config: SandboxConfig, { sandboxName }: { sandboxName?: string }) => {
  const result = await selectSandboxFlow(config, sandboxName)

  if (!result) {
    return
  }

  if (result.selection === INSTALL_OPTION) {
    log('INSTALL', result.sandboxName)
    await pullDockerImage(result.sandboxName)
    console.clear()
    await loop(config, { sandboxName: result.sandboxName })
  }

  if (result.selection === REMOVE_OPTION) {
    log('REMOVE', result.sandboxName)
    try {
      await removeDockerImage(result.sandboxName, false)
    } catch (e) {
      error(e.message)
      const res = await inquirer.prompt([
        {
          name: 'force',
          type: 'confirm',
          message: 'Do you want to force removal?',
          default: false,
        },
      ])
      if (res.force) {
        await removeDockerImage(result.sandboxName, true)
      }
    }
    await loop(config, { sandboxName: undefined })
  }

  if (result.selection === RUN_OPTION && result.sandbox) {
    log('RUN', `${result.sandbox.id} ${gray(result.sandboxName)}`)
    try {
      const ports: string[] = []
      if (config.portApi) {
        ports.push(config.portApi)
      }
      if (config.portWeb) {
        ports.push(config.portWeb)
      }
      if (config.ports) {
        ports.push(...(config.ports.includes(',') ? config.ports.split(',') : [config.ports]))
      }
      await runDockerImage(result.sandboxName, {
        options: {
          hostname: result.sandbox.id,
          name: result.sandbox.id,
          params: [],
          ports,
        },
      })
    } catch (e) {
      error(e.message)
    }
    // await loop(config, { sandboxName: result.sandboxName })
  }

  if (result.selection.startsWith(result.sandboxName)) {
    log('Running sandbox', result.selection)
    // const command = `${info.cli} generate ${result.selection}`
    // exec(command)
    log('Done')
  }

  if (result.selection === BACK_OPTION) {
    await loop(config, {})
  }
}

export const sandbox = async (config: SandboxConfig): Promise<void> => {
  await sandboxUrlCache(config)
  await loop(config, {})
}
