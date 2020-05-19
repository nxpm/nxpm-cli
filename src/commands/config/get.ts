import { flags } from '@oclif/command'
import { getConfigParam, setConfigParam } from '../../lib/config/config'
import { BaseCommand } from '../../utils'

export default class ConfigGet extends BaseCommand {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    global: flags.boolean({ char: 'g', description: 'Global config', required: true }),
  }

  static args = [
    {
      name: 'key',
      required: true,
    },
  ]

  async run() {
    const { args, flags } = this.parse(ConfigGet)

    await getConfigParam({
      global: flags.global,
      key: args.key,
      userConfig: this.userConfig,
      config: this.config,
    })
  }
}
