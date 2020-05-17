export interface BaseConfig {
  cwd: string
  dryRun: boolean
}

export interface ReleaseConfig extends BaseConfig {
  allowIvy: boolean
  fix: boolean
  version: string
}
