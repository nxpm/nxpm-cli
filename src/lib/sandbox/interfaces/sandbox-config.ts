import { BaseConfig } from '../../../utils/base-config'

export interface SandboxConfig extends BaseConfig {
  action?: string
  portApi?: string
  portWeb?: string
  ports?: string
  refresh: boolean
  sandboxId?: string
}
