import {expect, test} from '@oclif/test'

describe('registry:disable', () => {
  test
  .stdout()
  .command(['registry:disable'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['registry:disable', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
