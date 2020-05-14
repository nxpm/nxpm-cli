import * as chalk from 'chalk'

export const {
  greenBright,
  bold,
  inverse,
  redBright,
  red,
  yellowBright,
  magentaBright,
  gray,
} = chalk

export const info = (label = 'NXPM'): string => inverse(magentaBright(bold(` ${label} `)))
export const err = (label = 'ERROR'): string => inverse(redBright(bold(` ${label} `)))
export const log = (msg: string, ...params: unknown[]): void =>
  console.log(`${info()}`, `${greenBright(msg)}`, ...params)

export const error = (msg: string, ...params: unknown[]): void =>
  log(`${err()}`, `${yellowBright(msg)}`, ...params)
