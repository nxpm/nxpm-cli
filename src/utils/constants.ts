// These are the builders that the CLI knows can produce 'publishable' libs
export const NX_PACKAGE_BUILDERS = [
  '@nrwl/angular:package',
  '@nrwl/nest:package',
  '@nrwl/node:package',
  '@nrwl/workspace:run-commands',
  '@nrwl/web:package',
]
export const NXPM_PLUGINS_CACHE = 'nxpm-plugins.json'
export const NXPM_SANDBOX_CACHE = 'nxpm-sandbox.json'
export const NX_PLUGINS_URL =
  'https://gist.githubusercontent.com/beeman/11c2761fc1b6681182af3271b2badcaa/raw/official-plugins.json'
export const NX_COMMUNITY_PLUGINS_URL =
  'https://raw.githubusercontent.com/nrwl/nx/master/community/approved-plugins.json'
export const NXPM_PLUGINS_URL =
  'https://gist.githubusercontent.com/beeman/11c2761fc1b6681182af3271b2badcaa/raw/nxpm-plugins.json'
export const NXPM_SANDBOXES_URL =
  'https://raw.githubusercontent.com/nxpm/nxpm-docker-images/master/nxpm-sandboxes.json'
