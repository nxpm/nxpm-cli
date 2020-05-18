export interface BaseConfig {
  cwd: string
  dryRun?: boolean
}

export interface ReleaseConfig extends BaseConfig {
  ci: boolean
  dryRun: boolean
  allowIvy: boolean
  fix: boolean
  version: string
}
