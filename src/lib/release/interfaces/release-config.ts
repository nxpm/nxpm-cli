import { BaseConfig } from '../../../utils/base-config'

export interface ReleaseConfig extends BaseConfig {
  ci: boolean
  dryRun: boolean
  allowIvy: boolean
  fix: boolean
  version: string
}
