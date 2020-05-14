import { ReleaseConfig } from './release-config'

export interface ValidatedConfig extends ReleaseConfig {
  // NPM Scope defined in nx.json
  npmScope: string
  // Tag we aim to publish
  npmTag: 'latest' | 'next'
  // Content of the nx.json file
  nx: { [key: string]: any }
  // Content of the package.json file
  package: { [key: string]: any }
  // Whether it's a pre release or not
  preRelease: boolean
  // Content of angular.json or workspace.json
  workspace: { [key: string]: any }
  // Path to angular.json or workspace.json
  workspacePath: string
  // Type of workspace depending on existence of angular.json or workspace.json
  workspaceType: 'nx' | 'angular'
}
