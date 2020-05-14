import { Command, flags } from '@oclif/command'
import * as inquirer from 'inquirer'
import { release } from '../lib/release/release'
import { parseVersion } from '../utils/parse-version'

export default class Release extends Command {
  static description = 'Release publishable packages in an Nx Workspace'

  static flags = {
    cwd: flags.string({
      char: 'c',
      description: 'Current working directory',
      default: process.cwd(),
    }),
    help: flags.help({ char: 'h' }),
    'allow-ivy': flags.boolean({
      char: 'i',
      description: 'Allow publishing Angular packages built for Ivy',
      default: true,
    }),
    'dry-run': flags.boolean({ char: 'd', description: "Dry run, don't make permanent changes" }),
    fix: flags.boolean({ char: 'f', description: 'Automatically fix known issues' }),
  }

  static args = [
    {
      name: 'version',
      description: 'The version you want to release in semver format (eg: 1.2.3-beta.4)',
      required: false,
    },
  ]

  async run() {
    const { args, flags } = this.parse(Release)

    if (!args.version) {
      const response = await inquirer.prompt([
        {
          name: 'version',
          type: 'input',
          message: 'What version do you want to release?',
          validate(version: string): boolean | string {
            if (!parseVersion(version).isValid) {
              return 'Please use a valid semver version (eg: 1.2.3-beta.4)'
            }
            return true
          },
        },
      ])
      args.version = response.version
    }

    await release({
      allowIvy: flags['allow-ivy'],
      cwd: flags.cwd,
      dryRun: flags['dry-run'],
      fix: flags.fix,
      version: args.version,
    })
  }
}
