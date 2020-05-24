import { cli } from 'cli-ux'
import { existsSync } from 'fs'
import { join } from 'path'
import {
  cacheUrls,
  NX_COMMUNITY_PLUGINS_URL,
  NX_PLUGINS_URL,
  NXPM_PLUGINS_CACHE,
  NXPM_PLUGINS_URL,
} from '../../../utils'
import { PluginConfig } from '../interfaces/plugin-config'

export async function pluginUrlCache(config: PluginConfig) {
  const cacheFile = join(config.config.cacheDir, NXPM_PLUGINS_CACHE)
  const urls = [NX_PLUGINS_URL, NX_COMMUNITY_PLUGINS_URL, NXPM_PLUGINS_URL]

  if (config.userConfig?.plugins?.urls) {
    urls.push(...config.userConfig?.plugins?.urls)
  }

  if (!existsSync(join(cacheFile)) || config.refresh) {
    cli.action.start(`Downloading plugins registry from ${urls.length} source(s)`)
    await cacheUrls(urls, cacheFile)
    cli.action.stop()
  }
}
