import { existsSync } from 'fs'
import { readJSONSync } from 'fs-extra'
import { join } from 'path'
import { log } from './logging'

export interface WorkspaceInfo {
  cli: 'nx' | 'ng'
  cwd: string
  package: { [key: string]: any }
  nx: { [key: string]: any }
  type: 'nx' | 'angular'
  packageManager: 'npm' | 'yarn'
  path: string
  workspace: { [key: string]: any }
}

export interface WorkspaceParams {
  cwd: string
}

export function getWorkspaceInfo({ cwd }: WorkspaceParams): WorkspaceInfo {
  const angularJsonPath = join(cwd, 'angular.json')
  const nxJsonPath = join(cwd, 'nx.json')
  const packageJsonPath = join(cwd, 'package.json')
  const packageLockJsonPath = join(cwd, 'package-lock.json')
  const workspaceJsonPath = join(cwd, 'workspace.json')
  const yarnLockPath = join(cwd, 'yarn.lock')

  const angularJsonExists = existsSync(angularJsonPath)
  const packageLockJsonExists = existsSync(packageLockJsonPath)
  const workspaceJsonExists = existsSync(workspaceJsonPath)
  const yarnLockExists = existsSync(yarnLockPath)

  if (!angularJsonExists && !workspaceJsonExists) {
    throw new Error(`Can't find angular.json or workspace.json in ${cwd}`)
  }

  if (packageLockJsonExists && yarnLockExists) {
    log('WARNING', 'Found package-lock.json AND yarn.lock - defaulting to yarn.')
  }

  const type = workspaceJsonExists ? 'nx' : 'angular'
  const cli = workspaceJsonExists ? 'nx' : 'ng'
  const workspacePath = workspaceJsonExists ? workspaceJsonPath : angularJsonPath
  if (!existsSync(nxJsonPath)) {
    throw new Error(`Can't find nx.json in ${nxJsonPath}`)
  }

  const packageManager = yarnLockExists ? 'yarn' : 'npm'

  return {
    cli,
    cwd,
    package: readJSONSync(packageJsonPath),
    nx: readJSONSync(nxJsonPath),
    path: workspacePath,
    type,
    workspace: readJSONSync(workspacePath),
    packageManager,
  }
}
