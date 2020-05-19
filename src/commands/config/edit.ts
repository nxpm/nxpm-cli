import { flags } from '@oclif/command'
import { editConfig } from '../../lib/config/config'
import { BaseCommand } from '../../utils'

export default class ConfigEdit extends BaseCommand {
  static description = 'Edit the config file'

  static flags = {
    help: flags.help({ char: 'h' }),
    global: flags.boolean({ char: 'g', description: 'Global config', required: true }),
  }

  static args = []

  async run() {
    const { flags } = this.parse(ConfigEdit)

    await editConfig({
      global: flags.global,
      userConfig: this.userConfig,
      config: this.config,
    })
  }
}
