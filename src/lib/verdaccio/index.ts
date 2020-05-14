import { run } from '../../utils'

export function startRegistry() {
  run('npx verdaccio')
}

export function disableRegistry() {
  run('npm config delete registry')
  run('yarn config delete registry')
}

export function enableRegistry() {
  run('npm config set registry http://localhost:4873/')
  run('yarn config set registry http://localhost:4873/')
}

export function registryStatus() {
  run(`npm config get registry`)
  run(`yarn config get registry`)
}
