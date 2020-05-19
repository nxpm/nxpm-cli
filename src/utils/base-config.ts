import { UserConfig } from './user-config'

export interface BaseConfig {
  cwd: string
  dryRun?: boolean
  userConfig?: UserConfig
}
