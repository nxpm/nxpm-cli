import {expect, test} from '@oclif/test'

describe('registry:start', () => {
  test
  .stdout()
  .command(['registry:start'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['registry:start', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
