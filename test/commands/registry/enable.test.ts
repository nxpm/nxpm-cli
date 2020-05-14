import {expect, test} from '@oclif/test'

describe('registry:enable', () => {
  test
  .stdout()
  .command(['registry:enable'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['registry:enable', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
