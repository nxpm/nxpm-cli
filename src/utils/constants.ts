// These are the builders that the CLI knows can produce 'publishable' libs
import { join } from 'path'

export const NX_PACKAGE_BUILDERS = [
  '@nrwl/angular:package',
  '@nrwl/node:package',
  '@nrwl/nest:package,',
]
export const RELEASE_IT_PACKAGE_VERSION = '0.0.0-development'
export const NXPM_PLUGINS_CACHE = join(process.cwd(), 'tmp', 'nxpm-plugins.json')
export const NXPM_SANDBOX_CACHE = join(process.cwd(), 'tmp', 'nxpm-sandbox.json')
export const NX_PLUGINS_URL =
  'https://gist.githubusercontent.com/beeman/11c2761fc1b6681182af3271b2badcaa/raw/official-plugins.json'
export const NX_COMMUNITY_PLUGINS_URL =
  'https://raw.githubusercontent.com/nrwl/nx/master/community/approved-plugins.json'
export const NXPM_PLUGINS_URL =
  'https://gist.githubusercontent.com/beeman/11c2761fc1b6681182af3271b2badcaa/raw/nxpm-plugins.json'
export const NXPM_SANDBOXES_URL =
  'https://raw.githubusercontent.com/nxpm/nxpm-docker-images/master/nxpm-sandboxes.json'
