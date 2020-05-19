import { Command } from '@oclif/command'
import { mkdirp, pathExists, readJSON, writeJSON } from 'fs-extra'
import { join } from 'path'
import { defaultUserConfig, UserConfig } from './user-config'

export abstract class BaseCommand extends Command {
  public readonly configFile = join(this.config.configDir, 'config.json')
  userConfig: UserConfig = defaultUserConfig

  async init() {
    if (!(await pathExists(this.configFile))) {
      if (!(await pathExists(this.config.configDir))) {
        await mkdirp(this.config.configDir)
      }
      await writeJSON(this.configFile, JSON.stringify(defaultUserConfig, null))
    }
    this.userConfig = await readJSON(this.configFile)
  }
}
