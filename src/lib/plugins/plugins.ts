import { cli } from 'cli-ux'
import { existsSync } from 'fs'
import { mkdirpSync, readJSONSync, writeJSONSync } from 'fs-extra'
import * as inquirer from 'inquirer'
import fetch from 'node-fetch'
import { dirname, join } from 'path'
import {
  err,
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

export const loadPluginsSchematics = async (info: WorkspaceInfo) => {
  const plugins = readJSONSync(NX_PLUGINS_CACHE)
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
  pluginName?: string,
): Promise<{ selection: string; pluginName: string; plugin?: NxPlugin } | false> => {
  const {
    availablePluginNames,
    installedPluginNames,
    plugins,
    schematics,
  } = await loadPluginsSchematics(info)
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
    err(`Plugin ${pluginName} not found`)
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
    const schematicNames = found?.schematics.map((s) => s.name).sort()
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

const loop = async (info: WorkspaceInfo, { pluginName }: { pluginName?: string }) => {
  const result = await selectPluginFlow(info, pluginName)

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
    await loop(info, { pluginName: result.pluginName })
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
    await loop(info, { pluginName })
  }
}

export const plugins = async (config: BaseConfig): Promise<void> => {
  const info = getWorkspaceInfo({ cwd: config.cwd })

  if (!existsSync(join(NX_PLUGINS_CACHE))) {
    cli.action.start('Downloading list of plugins')
    mkdirpSync(dirname(NX_PLUGINS_CACHE))
    const cache = await fetch(NX_PLUGINS_URL).then((data: any) => data.json())
    writeJSONSync(NX_PLUGINS_CACHE, cache)
    cli.action.stop()
  }

  await loop(info, {})
}
