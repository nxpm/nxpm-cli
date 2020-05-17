export interface BaseConfig {
  cwd: string
  dryRun?: boolean
}

export interface ReleaseConfig extends BaseConfig {
  dryRun: boolean
  allowIvy: boolean
  fix: boolean
  version: string
}
