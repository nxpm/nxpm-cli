import { BaseConfig } from '../../../utils/base-config'

export interface SandboxConfig extends BaseConfig {
  action?: string
  refresh: boolean
  sandboxId?: string
}
