import { existsSync } from 'fs'
import { readJSONSync } from 'fs-extra'
import { join } from 'path'
import { log } from './logging'

export interface WorkspaceInfo {
  cwd: string
  package: { [key: string]: any }
  nx: { [key: string]: any }
  packageManager: 'npm' | 'yarn'
  path: string
  workspace: { [key: string]: any }
  workspaceJsonPath: string
}

export interface WorkspaceParams {
  cwd: string
}

export function getWorkspaceInfo({ cwd }: WorkspaceParams): WorkspaceInfo {
  const nxJsonPath = join(cwd, 'nx.json')
  const packageJsonPath = join(cwd, 'package.json')
  const packageLockJsonPath = join(cwd, 'package-lock.json')
  const yarnLockPath = join(cwd, 'yarn.lock')

  const packageLockJsonExists = existsSync(packageLockJsonPath)
  const yarnLockExists = existsSync(yarnLockPath)

  if (packageLockJsonExists && yarnLockExists) {
    log('WARNING', 'Found package-lock.json AND yarn.lock - defaulting to yarn.')
  }

  const workspacePath = join(process.cwd(), 'nx.json')
  if (!existsSync(nxJsonPath)) {
    throw new Error(`Can't find nx.json in ${nxJsonPath}`)
  }

  const packageManager = yarnLockExists ? 'yarn' : 'npm'

  return {
    cwd,
    package: readJSONSync(packageJsonPath),
    nx: existsSync(nxJsonPath) ? readJSONSync(nxJsonPath) : {},
    path: workspacePath,
    workspace: readJSONSync(workspacePath),
    workspaceJsonPath: workspacePath,
    packageManager,
  }
}
