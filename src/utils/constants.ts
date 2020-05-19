// These are the builders that the CLI knows can produce 'publishable' libs
import { join } from 'path'

export const NX_PACKAGE_BUILDERS = [
  '@nrwl/angular:package',
  '@nrwl/node:package',
  '@nrwl/nest:package,',
]
export const RELEASE_IT_PACKAGE_VERSION = '0.0.0-development'
export const NXPM_PLUGINS_CACHE = join(process.cwd(), 'tmp', 'nxpm-plugins.json')
export const NX_PLUGINS_URL =
  'https://gist.githubusercontent.com/beeman/11c2761fc1b6681182af3271b2badcaa/raw/59036e23183841621df5e4344876676d8396108f/official-plugins.json'
export const NX_COMMUNITY_PLUGINS_URL =
  'https://raw.githubusercontent.com/nrwl/nx/master/community/approved-plugins.json'
export const NXPM_PLUGINS_URL =
  'https://gist.githubusercontent.com/beeman/11c2761fc1b6681182af3271b2badcaa/raw/bf21c5920e613ebe9a415dfd0b0c3a91c29566ea/nxpm-plugins.json'
