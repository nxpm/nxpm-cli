import { Command } from '@oclif/command'
import { disableRegistry } from '../../lib/verdaccio'

export default class RegistryDisable extends Command {
  static description = 'Disable yarn and npm from using local npm registry'

  async run() {
    disableRegistry()
  }
}
