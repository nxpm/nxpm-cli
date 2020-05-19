import { IConfig } from '@oclif/config'
import { unlink } from 'fs-extra'
import { get, has, set } from 'lodash'
import { error, exec, log, warning } from '../../utils'
import { UserConfig } from '../../utils/user-config'
import { getConfigFile, getConfigFilePath, updateConfigFile } from './utils/config-utils'

export interface EditConfigParamOptions {
  config: IConfig
  global: boolean
  userConfig: UserConfig
}

export interface GetConfigParamOptions extends EditConfigParamOptions {
  key: string
}
export interface SetConfigParamOptions extends GetConfigParamOptions {
  value: string
}

function validateOptions(
  options: EditConfigParamOptions | GetConfigParamOptions | SetConfigParamOptions,
) {
  if (!options.global) {
    error(`The cli currently only supports global variables.`)
    process.exit(1)
  }
}

export async function deleteConfig(options: EditConfigParamOptions) {
  validateOptions(options)
  const configFile = await getConfigFilePath(options.config)
  await unlink(configFile)
  log('DELETE', `Deleted ${configFile}`)
}

export async function editConfig(options: EditConfigParamOptions) {
  validateOptions(options)
  const configFile = await getConfigFilePath(options.config)
  const editor = process.env.EDITOR || 'vim'
  const command = `${editor} ${configFile}`
  exec(command)
}

export async function getConfigParam(options: GetConfigParamOptions) {
  validateOptions(options)
  const configFile = await getConfigFile(options.config)
  const keyExists = has(configFile, options.key)

  if (!keyExists) {
    warning(`Option ${options.key} is not set`)
    process.exit()
  }
  console.log(JSON.stringify(get(configFile, options.key), null, 2))
}

export async function setConfigParam(options: SetConfigParamOptions) {
  validateOptions(options)
  const configFile = await getConfigFile(options.config)
  const keyExists = has(configFile, options.key)

  if (keyExists && get(configFile, options.key) === options.value) {
    warning(`Option ${options.key} is already set to ${options.value}`)
    process.exit()
  }
  const updated = set(configFile, options.key, options.value)
  await updateConfigFile(options.config, updated)
  log(keyExists ? 'UPDATE' : 'CREATE', `Set option ${options.key} to ${options.value}`)
}
