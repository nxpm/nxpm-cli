import {expect, test} from '@oclif/test'

describe('config:edit', () => {
  test
  .stdout()
  .command(['config:edit'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['config:edit', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
