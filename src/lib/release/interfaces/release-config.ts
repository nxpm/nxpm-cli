import { BaseConfig } from '../../../utils/base-config'

export interface ReleaseConfig extends BaseConfig {
  build: boolean
  ci: boolean
  cwd: string
  dryRun: boolean
  fix: boolean
  local?: boolean
  localUrl?: string
  version: string
}
