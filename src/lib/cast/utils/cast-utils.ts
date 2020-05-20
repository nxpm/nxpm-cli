const { streamWrite, streamEnd, onExit } = require('@rauschma/stringio')
const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

import { spawn } from 'child_process'
import { Writable } from 'stream'

export const chars = {
  DOWN: '\x1B\x5B\x42',
  UP: '\x1B\x5B\x41',
  ENTER: '\x0D',
  SPACE: '\x20',
}

async function writeToWritable(writable: Writable) {
  await streamWrite(writable, 'nxpm projects\n')
  // await wait(1000)
  await streamWrite(writable, chars.DOWN)
  await streamWrite(writable, chars.UP)
  await wait()
  await streamWrite(writable, chars.ENTER)
  await wait(1000)
  await streamWrite(writable, chars.DOWN)
  await wait()
  await streamWrite(writable, chars.DOWN)
  await wait()
  await streamWrite(writable, chars.DOWN)
  await wait()
  await streamWrite(writable, chars.ENTER)
  await streamEnd(writable)
  await wait()
}

export async function runCast(cast: { command: string; inputs: string[] }) {
  const sink = spawn('zsh', [], { stdio: ['pipe', process.stdout, process.stderr] }) // (A)

  await writeToWritable(sink.stdin) // (B)
  await onExit(sink)

  console.log('### DONE')
}
