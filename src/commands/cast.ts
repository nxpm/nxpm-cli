import { flags } from '@oclif/command'
import { cast } from '../lib/cast/cast'
import { BaseCommand } from '../utils'

export default class Cast extends BaseCommand {
  static description = 'Create screencasts of CLI interactions'

  static flags = {
    cwd: flags.string({
      char: 'c',
      description: 'Current working directory',
      default: process.cwd(),
    }),
    help: flags.help({ char: 'h' }),
  }

  static args = [
    {
      name: 'preset',
      description: 'Preset you want to cast',
      required: true,
    },
  ]

  async run() {
    const { args } = this.parse(Cast)

    await cast({
      config: this.config,
      preset: args.preset,
      userConfig: this.userConfig,
    })
  }
}
