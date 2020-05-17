import { Command, flags } from '@oclif/command'
import { projects } from '../lib/projects/projects'

export default class Projects extends Command {
  static aliases = ['p']

  static description = 'Interactive menu to run builders and schematics for projects'

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
      name: 'projectName',
      description: 'The name of the project you want to operate on',
      required: false,
    },
  ]

  async run() {
    const { args, flags } = this.parse(Projects)

    await projects({ cwd: flags.cwd, dryRun: false }, args.projectName)
  }
}
