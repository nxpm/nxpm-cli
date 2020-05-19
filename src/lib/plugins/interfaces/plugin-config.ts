import { BaseConfig } from '../../../utils/base-config'

export interface PluginConfig extends BaseConfig {
  cwd: string
  refresh: boolean
}
