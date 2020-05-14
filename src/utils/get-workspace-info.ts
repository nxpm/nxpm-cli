import { existsSync } from 'fs'
import { readJSONSync } from 'fs-extra'
import { join } from 'path'

export interface WorkspaceInfo {
  package: { [key: string]: any }
  nx: { [key: string]: any }
  type: 'nx' | 'angular'
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
  const workspaceJsonPath = join(cwd, 'workspace.json')

  const angularJsonExists = existsSync(angularJsonPath)
  const workspaceJsonExists = existsSync(workspaceJsonPath)

  if (!angularJsonExists && !workspaceJsonExists) {
    throw new Error(`Can't find angular.json or workspace.json in ${cwd}`)
  }

  const type = workspaceJsonPath ? 'nx' : 'angular'
  const workspacePath = workspaceJsonExists ? workspaceJsonPath : angularJsonPath
  if (!existsSync(nxJsonPath)) {
    throw new Error(`Can't find nx.json in ${nxJsonPath}`)
  }

  return {
    package: readJSONSync(packageJsonPath),
    nx: readJSONSync(nxJsonPath),
    path: workspacePath,
    type,
    workspace: readJSONSync(workspacePath),
  }
}
