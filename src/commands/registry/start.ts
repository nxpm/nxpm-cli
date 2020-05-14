import { Command } from '@oclif/command'
import { startRegistry } from '../../lib/verdaccio'

export default class RegistryStart extends Command {
  static description = 'Start local npm registry'

  async run() {
    startRegistry()
  }
}
