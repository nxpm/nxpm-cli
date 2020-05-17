import { Command, flags } from '@oclif/command'
import { plugins } from '../lib/plugins/plugins'

export default class Plugins extends Command {
  static aliases = ['pl']

  static description = 'Install and remove community plugins'

  static flags = {
    cwd: flags.string({
      char: 'c',
      description: 'Current working directory',
      default: process.cwd(),
    }),
    help: flags.help({ char: 'h' }),
  }

  async run() {
    const { flags } = this.parse(Plugins)

    await plugins({ cwd: flags.cwd })
  }
}
