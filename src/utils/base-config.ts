import { IConfig } from '@oclif/config'
import { UserConfig } from './user-config'

export interface BaseConfig {
  config: IConfig
  cwd?: string
  dryRun?: boolean
  userConfig?: UserConfig
}
