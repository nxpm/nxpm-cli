import { error } from '../../utils'
import { CastConfig } from './interfaces/cast-config'
import { chars, runCast } from './utils/cast-utils'

export const casts = [
  {
    preset: 'projects',
    cmd: 'zsh',
    inputs: ['nxpm projects', 'nxpm projects', chars.ENTER],
  },
]

export const cast = async (config: CastConfig): Promise<void> => {
  const cast = casts.find((c) => c.preset === config.preset)

  if (!cast) {
    error(`Preset ${config.preset} not found`)
    return Promise.reject()
  }

  runCast({ inputs: cast.inputs, command: cast.cmd })
}

const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))
