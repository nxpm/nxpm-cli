import {expect, test} from '@oclif/test'

describe('registry:status', () => {
  test
  .stdout()
  .command(['registry:status'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['registry:status', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
