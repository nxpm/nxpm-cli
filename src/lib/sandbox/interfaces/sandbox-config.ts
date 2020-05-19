import { IConfig } from '@oclif/config'
import { BaseConfig } from '../../../utils/base-config'

export interface SandboxConfig extends BaseConfig {
  action?: string
  config: IConfig
  portApi?: string
  portWeb?: string
  ports?: string
  refresh: boolean
  sandboxId?: string
}
