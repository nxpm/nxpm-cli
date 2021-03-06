import { flags } from '@oclif/command'
import { sandboxPull } from '../../lib/sandbox/sandbox-pull'
import { BaseCommand } from '../../utils'

export default class SandboxPull extends BaseCommand {
  static description = 'Pull images of sandboxes'

  static flags = {
    force: flags.boolean({
      char: 'f',
      description: 'Force removal of the sandboxes',
      default: false,
    }),
    help: flags.help({ char: 'h' }),
    refresh: flags.boolean({
      char: 'r',
      description: 'Refresh the list of sandboxes',
      default: false,
    }),
    remove: flags.boolean({
      char: 'm',
      description: 'Remove all of the sandboxes before pulling',
      default: false,
    }),
  }

  async run() {
    const { flags } = this.parse(SandboxPull)

    await sandboxPull({
      force: flags.force,
      refresh: flags.refresh,
      remove: flags.remove,
      config: this.config,
      userConfig: this.userConfig,
    })
  }
}
