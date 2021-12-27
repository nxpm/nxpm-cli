import { spawnSync } from 'child_process'
import { cli } from 'cli-ux'
import { existsSync } from 'fs'
import { readJSON } from 'fs-extra'
import { join } from 'path'
import {
  cacheUrls,
  error,
  exec,
  gray,
  log,
  NXPM_SANDBOX_CACHE,
  NXPM_SANDBOXES_URL,
} from '../../../utils'
import { Sandbox } from '../interfaces/sandbox'
import { SandboxConfig } from '../interfaces/sandbox-config'

export async function getDockerContainer(name: string) {
  const raw = spawnSync(`docker`, [
    'ps',
    '--no-trunc',
    '-f',
    `name=${name}`,
    `--no-trunc`,
    `--format`,
    `{{ json . }}`,
  ])
  if (raw.stdout) {
    try {
      return JSON.parse(raw.stdout.toString())
    } catch (e) {}
  }
}

export async function getDockerImages() {
  const res: any[] = []
  const raw = spawnSync(`docker`, ['images', `--no-trunc`, `--format`, `{{ json . }}`])

  if (raw.stdout) {
    const lines = raw.stdout?.toString()
    lines
      ?.split('\n')
      .filter((line) => !!line)
      .forEach((line) => {
        try {
          const parsed = JSON.parse(line)
          if (parsed.Repository && parsed.Tag) {
            res.push(`${parsed.Repository}:${parsed.Tag}`)
          }
        } catch (e) {}
      })
  }
  return res
}

export async function sandboxUrlCache(config: SandboxConfig) {
  const cacheFile = join(config.config.cacheDir, NXPM_SANDBOX_CACHE)
  const urls = [NXPM_SANDBOXES_URL]

  if (config.userConfig?.sandbox?.urls) {
    urls.push(...config.userConfig?.sandbox?.urls)
  }

  if (!existsSync(join(cacheFile)) || config.refresh) {
    cli.action.start(`Downloading sandbox registry from ${urls.length} source(s)`)
    await cacheUrls(urls, cacheFile)
    cli.action.stop()
  }
}

export async function getSandboxUrlCache(config: SandboxConfig): Promise<Sandbox[]> {
  const cacheFile = join(config.config.cacheDir, NXPM_SANDBOX_CACHE)
  const sandboxGroups = await readJSON(cacheFile)
  return Object.values(sandboxGroups).flat() as Sandbox[]
}

export async function removeDockerImage(image: string, force: boolean) {
  return exec(`docker rmi ${force ? '-f' : ''} ${image}`, { stdio: [] })
}

export async function pullDockerImage(image: string) {
  return exec(`docker pull ${image}`)
}

export async function attachDockerImage(image: string, options: { name: string }) {
  const existing = await getDockerContainer(options.name)

  if (!existing) {
    error(`Can't find container ${options.name}`)
    return Promise.reject()
  }

  const cmd = 'docker'
  const action = 'exec'
  const params = ['-it']
  const command = [cmd, action, params.join(' '), options.name, 'zsh', '&& true'].join(' ')
  log('ATTACH', gray(command))
  return exec(command)
}

export async function runDockerImage(
  image: string,
  { options }: { options: { hostname?: string; name: string; params?: string[]; ports: string[] } },
) {
  const existing = await getDockerContainer(options.name)

  if (existing) {
    return attachDockerImage(image, { name: options.name })
  }

  const host = process.env.DOCKER_MACHINE_NAME ? process.env.DOCKER_MACHINE_NAME : 'localhost'
  const cmd = 'docker'
  const action = 'run'
  const ports = options.ports
    .map((p) => (p.includes(':') ? p : `${p}:${p}`))
    .map((p) => {
      log('LISTEN', `http://${host}:${p.split(':')[0]}`)
      return p
    })
    .map((p) => `-p ${p}`)
    .join(' ')

  const defaultParams = [
    '-it',
    '--rm',
    options.name ? `--name ${options.name}` : '',
    options.hostname ? `--hostname ${options.hostname}` : '',
    ports,
  ]
  const params = options.params || []
  const command = [cmd, action, defaultParams.join(' '), params.join(' '), image, '&& true'].join(
    ' ',
  )
  log('RUN', gray(command))
  return exec(command)
}
