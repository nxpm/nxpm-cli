import { flags } from '@oclif/command'
import { sandbox } from '../lib/sandbox/sandbox'
import { BaseCommand } from '../utils'

export default class Sandbox extends BaseCommand {
  static description = 'Create a sandbox using Docker'

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

  static args = [
    {
      name: 'sandboxId',
      description: 'The ID of the sandbox',
      required: false,
    },
    {
      name: 'action',
      description: 'Action to perform on sandbox',
      required: false,
    },
  ]

  async run() {
    const { args, flags } = this.parse(Sandbox)

    await sandbox({
      action: args.action,
      cwd: flags.cwd,
      refresh: flags.refresh,
      sandboxId: args.sandboxId,
      userConfig: this.userConfig,
    })
  }
}
