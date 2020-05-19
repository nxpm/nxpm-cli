import * as chalk from 'chalk'

export const {
  whiteBright,
  greenBright,
  bold,
  inverse,
  redBright,
  red,
  yellowBright,
  magentaBright,
  gray,
} = chalk

const info = (label = 'NXPM'): string => inverse(magentaBright(bold(` ${label} `)))
const err = (label = 'ERROR'): string => inverse(redBright(bold(` ${label} `)))
const warn = (label = 'WARN'): string => inverse(yellowBright(bold(` ${label} `)))
export const log = (msg: string, ...params: unknown[]): void =>
  console.log(`${info()}`, `${greenBright(msg)}`, ...params)

export const error = (msg: string, ...params: unknown[]): void =>
  log(`${err()}`, `${redBright(msg)}`, ...params)

export const warning = (msg: string, ...params: unknown[]): void =>
  log(`${warn()}`, `${yellowBright(msg)}`, ...params)
