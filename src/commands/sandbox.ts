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
    'port-api': flags.string({
      description: 'Port to open for the API app',
      default: '3000',
    }),
    'port-web': flags.string({
      description: 'Port to open for the Web app',
      default: '4200',
    }),
    ports: flags.string({
      description: 'Comma-separated list of additional ports to open (eg: 8080, 10080:80)',
      default: '',
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
      config: this.config,
      refresh: flags.refresh,
      portApi: flags['port-api'],
      portWeb: flags['port-web'],
      ports: flags.ports,
      sandboxId: args.sandboxId,
      userConfig: this.userConfig,
    })
  }
}
