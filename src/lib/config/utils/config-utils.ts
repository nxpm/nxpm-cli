import { IConfig } from '@oclif/config'
import { readJSON, writeJSON } from 'fs-extra'
import { join } from 'path'
import { UserConfig } from '../../../utils/user-config'

export function getConfigFilePath(config: IConfig) {
  return join(config.configDir, 'config.json')
}
export async function getConfigFile(config: IConfig) {
  return readJSON(getConfigFilePath(config))
}

export async function updateConfigFile(config: IConfig, content: UserConfig) {
  return writeJSON(getConfigFilePath(config), content, { spaces: 2 })
}
