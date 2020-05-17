// These are the builders that the CLI knows can produce 'publishable' libs
import { join } from 'path'

export const NX_PACKAGE_BUILDERS = [
  '@nrwl/angular:package',
  '@nrwl/node:package',
  '@nrwl/nest:package,',
]
export const RELEASE_IT_PACKAGE_VERSION = '0.0.0-development'
export const NX_PLUGINS_CACHE = join(process.cwd(), 'tmp', 'nx-plugins.json')
export const NX_PLUGINS_URL =
  'https://raw.githubusercontent.com/nrwl/nx/master/community/approved-plugins.json'
