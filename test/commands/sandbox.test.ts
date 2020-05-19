import {expect, test} from '@oclif/test'

describe('sandbox', () => {
  test
  .stdout()
  .command(['sandbox'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['sandbox', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
