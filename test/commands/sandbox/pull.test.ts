import {expect, test} from '@oclif/test'

describe('sandbox:pull', () => {
  test
  .stdout()
  .command(['sandbox:pull'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['sandbox:pull', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
