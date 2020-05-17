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
} from '../../utils'
import { readAllSchematicCollections } from '../../utils/vendor/nx-console/read-schematic-collections'
import { SchematicCollection } from '../../utils/vendor/nx-console/schema'
import { BACK_OPTION, INSTALL_OPTION, REMOVE_OPTION } from '../projects/projects'
import { BaseConfig } from '../release/interfaces/release-config'

export interface NxPlugin {
  name: string
  description: string
  url: string
}

export const selectPlugin = async (plugins: any[]): Promise<{ pluginName: string } | false> => {
  const pluginName = await selectFromList(plugins, { message: 'Plugins', addExit: true })
  if (!pluginName) {
    return false
  }
  return { pluginName }
}

export const selectPluginFlow = async (
  available: NxPlugin[],
  installed: NxPlugin[],
): Promise<{ selection: string; pluginName: string; plugin?: NxPlugin } | false> => {
  const options: any[] = []
  if (available.length !== 0) {
    options.push(
      new inquirer.Separator('Available Plugins'),
      ...available.map((p) => p.name).sort(),
    )
  }
  if (installed.length !== 0) {
    options.push(
      new inquirer.Separator('Installed Plugins'),
      ...installed.map((p) => p.name).sort(),
    )
  }
  const pluginResult = await selectPlugin(options)

  if (!pluginResult) {
    return Promise.resolve(false)
  }
  const { pluginName } = pluginResult

  const plugin = [...available, ...installed].find((p) => p.name === pluginName)
  if (!plugin) {
    return Promise.resolve(false)
  }

  // eslint-disable-next-line no-console
  console.log(`
  ${plugin.description}
  ${gray(plugin.url)}
`)
  const isInstalled = installed.map((p) => p.name).includes(pluginName)
  const availableOptions = [INSTALL_OPTION]
  const installedOptions = [REMOVE_OPTION]

  const selection = await selectFromList(isInstalled ? installedOptions : availableOptions, {
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

const loop = async (info: WorkspaceInfo, available: NxPlugin[], installed: NxPlugin[]) => {
  const result = await selectPluginFlow(available, installed)

  if (!result) {
    return
  }

  if (result.selection === INSTALL_OPTION) {
    const command =
      info.packageManager === 'yarn'
        ? `yarn add ${result.pluginName}`
        : `npm install ${result.pluginName}`
    log('Installing plugin')
    exec(command, { stdio: 'ignore' })
    log('Done')
  }

  if (result.selection === REMOVE_OPTION) {
    const command =
      info.packageManager === 'yarn'
        ? `yarn remove ${result.pluginName}`
        : `npm uninstall ${result.pluginName}`
    log('Removing plugin')
    exec(command, { stdio: 'ignore' })
    log('Done')
  }

  if (result.selection === BACK_OPTION) {
    await loop(info, available, installed)
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

  cli.action.start('Loading plugins')
  const plugins = readJSONSync(NX_PLUGINS_CACHE)
  const schematics = await readAllSchematicCollections(info.workspaceJsonPath)
  const schematicsNames = schematics.map((s: SchematicCollection) => s.name)
  const availablePlugins = plugins.filter((p: NxPlugin) => !schematicsNames.includes(p.name))
  const installedPlugins = plugins.filter((p: NxPlugin) => schematicsNames.includes(p.name))
  cli.action.stop()

  await loop(info, availablePlugins, installedPlugins)
}
