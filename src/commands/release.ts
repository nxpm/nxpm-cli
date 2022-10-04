import { flags } from '@oclif/command'
import * as inquirer from 'inquirer'
import { release } from '../lib/release/release'
import { BaseCommand, log } from '../utils'
import { parseVersion } from '../utils/parse-version'

export default class Release extends BaseCommand {
  static description = 'Release publishable packages in an Nx Workspace'

  static flags = {
    build: flags.boolean({ char: 'b', description: 'Build libraries after versioning' }),
    ci: flags.boolean({
      description: 'CI mode (fully automatic release)',
      default: false,
    }),
    cwd: flags.string({
      char: 'c',
      description: 'Current working directory',
      default: process.cwd(),
    }),
    'dry-run': flags.boolean({ char: 'd', description: "Dry run, don't make permanent changes" }),
    help: flags.help({ char: 'h' }),
    fix: flags.boolean({ char: 'f', description: 'Automatically fix known issues' }),
    local: flags.boolean({
      description: 'Release package to local registry',
      default: false,
    }),
    localUrl: flags.string({
      description: 'URL to local registry',
      default: 'http://localhost:4873/',
    }),
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

    if (this.userConfig?.release?.github?.token) {
      log('GITHUB_TOKEN', 'Using token from config file')
      process.env.GITHUB_TOKEN = this.userConfig?.release?.github?.token
    }

    await release({
      build: flags.build,
      ci: flags.ci,
      config: this.config,
      cwd: flags.cwd,
      dryRun: flags['dry-run'],
      fix: flags.fix,
      version: args.version,
      local: flags.local,
      localUrl: flags.localUrl,
    })
  }
}
