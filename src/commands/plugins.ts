import { flags } from '@oclif/command'
import { plugins } from '../lib/plugins/plugins'
import { BaseCommand } from '../utils'

export default class Plugins extends BaseCommand {
  static aliases = ['pl']

  static description = 'Install and remove community plugins'

  static flags = {
    cwd: flags.string({
      char: 'c',
      description: 'Current working directory',
      default: process.cwd(),
    }),
    help: flags.help({ char: 'h' }),
    refresh: flags.boolean({
      char: 'r',
      description: 'Refresh the list of plugins',
      default: false,
    }),
  }

  async run() {
    const { flags } = this.parse(Plugins)

    await plugins({ cwd: flags.cwd, userConfig: this.userConfig, refresh: flags.refresh })
  }
}
