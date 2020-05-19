import { SandboxConfig } from './sandbox-config'

export interface SandboxPullConfig extends SandboxConfig {
  force: boolean
  remove: boolean
}
