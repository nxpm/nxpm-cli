import { flags } from '@oclif/command'
import { deleteConfig } from '../../lib/config/config'
import { BaseCommand } from '../../utils'

export default class ConfigDelete extends BaseCommand {
  static description = 'Delete the config file'

  static flags = {
    help: flags.help({ char: 'h' }),
    global: flags.boolean({ char: 'g', description: 'Global config', required: true }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(ConfigDelete)

    await deleteConfig({
      global: flags.global,
      userConfig: this.userConfig,
      config: this.config,
    })
  }
}
