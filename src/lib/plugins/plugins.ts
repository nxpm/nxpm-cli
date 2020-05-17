import { cli } from 'cli-ux'
import { existsSync } from 'fs'
import { mkdirpSync, readJSONSync, writeJSONSync } from 'fs-extra'
import * as inquirer from 'inquirer'
import fetch from 'node-fetch'
import { dirname, join } from 'path'
import {
  exec,
  getWorkspaceInfo,
  gray,
  log,
  NX_PLUGINS_CACHE,
  NX_PLUGINS_URL,
  selectFromList,
  WorkspaceInfo,
  yellowBright,
  whiteBright,
} from '../../utils'
import { BACK_OPTION } from '../projects/projects'
import { BaseConfig } from '../release/interfaces/release-config'

export interface NxPlugin {
  name: string
  description: string
  url: string
}

export const selectPlugin = async (
  plugins: NxPlugin[],
): Promise<{ pluginName: string; plugin?: NxPlugin } | false> => {
  const options = plugins.map((plugin: NxPlugin) => plugin.name)
  const pluginName = await selectFromList(options, { message: 'Available plugins', addExit: true })
  if (!pluginName) {
    return false
  }
  return { pluginName, plugin: plugins.find((plugin: NxPlugin) => plugin.name === pluginName) }
}

export const selectPluginFlow = async (
  plugins: NxPlugin[],
): Promise<{ selection: string; pluginName: string; plugin?: NxPlugin } | false> => {
  const pluginResult = await selectPlugin(plugins)

  if (!pluginResult) {
    return Promise.resolve(false)
  }
  const { plugin, pluginName } = pluginResult

  if (!plugin) {
    return Promise.resolve(false)
  }

  // eslint-disable-next-line no-console
  console.log(`
  ${plugin.description}
  ${gray(plugin.url)}
`)

  const selection = await selectFromList(['Install'], {
    addBack: true,
    addExit: true,
    message: pluginName,
  })

  if (!selection) {
    return Promise.resolve(false)
  }

  return {
    selection,
    pluginName,
    plugin,
  }
}

const loop = async (info: WorkspaceInfo, plugins: NxPlugin[]) => {
  const result = await selectPluginFlow(plugins)

  if (!result) {
    return
  }

  if (result.selection === 'Install') {
    const command =
      info.packageManager === 'yarn'
        ? `yarn add ${result.pluginName}`
        : `npm install ${result.pluginName}`
    exec(command)
  }
  if (result.selection === BACK_OPTION) {
    await loop(info, plugins)
  }
}

export const plugins = async (config: BaseConfig): Promise<void> => {
  log('Plugins', gray(`Working directory ${config.cwd}`))

  const info = getWorkspaceInfo({ cwd: config.cwd })

  if (!existsSync(join(NX_PLUGINS_CACHE))) {
    cli.action.start('Downloading list of plugins')
    mkdirpSync(dirname(NX_PLUGINS_CACHE))
    const cache = await fetch(NX_PLUGINS_URL).then((data: any) => data.json())
    writeJSONSync(NX_PLUGINS_CACHE, cache)
    cli.action.stop()
  }

  const plugins = readJSONSync(NX_PLUGINS_CACHE)

  await loop(info, plugins)
}
