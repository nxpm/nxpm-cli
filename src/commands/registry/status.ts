import { Command } from '@oclif/command'
import { registryStatus } from '../../lib/verdaccio'

export default class RegistryStatus extends Command {
  static description = 'Show yarn and npm registry configuration'
  async run() {
    registryStatus()
  }
}
