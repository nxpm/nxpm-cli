import { readJSON } from 'fs-extra'
import * as inquirer from 'inquirer'
import { join } from 'path'
import {
  error,
  exec,
  getWorkspaceInfo,
  gray,
  log,
  NX_COMMUNITY_PLUGINS_URL,
  NX_PLUGINS_URL,
  NXPM_PLUGINS_CACHE,
  NXPM_PLUGINS_URL,
  selectFromList,
  WorkspaceInfo,
} from '../../utils'
import { readAllSchematicCollections } from '../../utils/vendor/nx-console/read-schematic-collections'
import { SchematicCollection } from '../../utils/vendor/nx-console/schema'
import { BACK_OPTION, INSTALL_OPTION, REMOVE_OPTION } from '../projects/projects'
import { PluginConfig } from './interfaces/plugin-config'
import { pluginUrlCache } from './utils/plugin-utils'

export interface NxPlugin {
  name: string
  description: string
  url: string
}

export const loadPluginsSchematics = async (info: WorkspaceInfo, config: PluginConfig) => {
  const cacheFile = join(config.config.cacheDir, NXPM_PLUGINS_CACHE)
  const pluginGroups = await readJSON(cacheFile)
  const plugins = Object.values(pluginGroups).flat()
  const schematics = await readAllSchematicCollections(info.workspaceJsonPath)
  const schematicsNames = schematics.map((s: SchematicCollection) => s.name)
  const availablePlugins = plugins.filter((p: NxPlugin) => !schematicsNames.includes(p.name))
  const installedPlugins = plugins.filter((p: NxPlugin) => schematicsNames.includes(p.name))
  const availablePluginNames = availablePlugins.map((p: NxPlugin) => p.name)
  const installedPluginNames = installedPlugins.map((p: NxPlugin) => p.name)
  return {
    plugins,
    schematics,
    schematicsNames,
    availablePlugins,
    availablePluginNames,
    installedPlugins,
    installedPluginNames,
    pluginNames: [...availablePluginNames, ...installedPluginNames],
  }
}

export const selectPlugin = async (
  plugins: any[],
  message: string,
): Promise<{ pluginName: string } | false> => {
  const pluginName = await selectFromList(plugins, { message, addExit: true })
  if (!pluginName) {
    return false
  }
  return { pluginName }
}

export const selectPluginFlow = async (
  info: WorkspaceInfo,
  config: PluginConfig,
  pluginName?: string,
): Promise<{ selection: string; pluginName: string; plugin?: NxPlugin } | false> => {
  const {
    availablePluginNames,
    installedPluginNames,
    plugins,
    schematics,
  } = await loadPluginsSchematics(info, config)
  const options: any[] = []

  if (!pluginName) {
    console.clear()
    if (availablePluginNames.length !== 0) {
      options.push(new inquirer.Separator('Available Plugins'), ...availablePluginNames.sort())
    }
    if (installedPluginNames.length !== 0) {
      options.push(new inquirer.Separator('Installed Plugins'), ...installedPluginNames.sort())
    }
    const pluginResult = await selectPlugin(options, 'Plugins')

    if (!pluginResult) {
      return Promise.resolve(false)
    }
    pluginName = pluginResult.pluginName
  }

  const plugin = plugins.find((p: NxPlugin) => p.name === pluginName)

  if (!plugin) {
    error(`Plugin ${pluginName} not found`)
    return Promise.resolve(false)
  }

  // eslint-disable-next-line no-console
  console.log(`
  ${plugin.description}
  ${gray(plugin.url)}
`)
  const isInstalled = installedPluginNames.includes(pluginName)
  const availableOptions = [INSTALL_OPTION]
  const installedOptions = [REMOVE_OPTION]

  if (isInstalled) {
    const found = schematics.find((s: SchematicCollection) => s.name === pluginName)
    const schematicNames = found?.schematics.map((s) => s.name).reverse()
    schematicNames?.forEach((name: string) => installedOptions.unshift(`${pluginName}:${name}`))
  }

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

const loop = async (
  info: WorkspaceInfo,
  config: PluginConfig,
  { pluginName }: { pluginName?: string },
) => {
  const result = await selectPluginFlow(info, config, pluginName)

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
    console.clear()
    await loop(info, config, { pluginName: result.pluginName })
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

  if (result.selection.startsWith(result.pluginName)) {
    log('Running schematic', result.selection)
    const command = `${info.cli} generate ${result.selection}`
    exec(command)
    log('Done')
  }

  if (result.selection === BACK_OPTION) {
    await loop(info, config, { pluginName })
  }
}

export const plugins = async (config: PluginConfig): Promise<void> => {
  const info = getWorkspaceInfo({ cwd: config.cwd })
  await pluginUrlCache(config)
  await loop(info, config, {})
}
