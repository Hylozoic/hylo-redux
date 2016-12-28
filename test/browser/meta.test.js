import {
  loadTestFile, writeTestFile, TestRunner, removeTestFile
} from './support'

describe('browser testing setup', function () {
  this.timeout(10000)

  describe('reading a local file', () => {
    before(() => writeTestFile(`<html><body>hello world!</body></html>`))
    after(() => removeTestFile())

    it('works', function () {
      return loadTestFile()
      .evaluate(() => document.body.textContent)
      .end()
      .then(text => expect(text).to.equal('hello world!'))
    })
  })

  describe('rendering a React component with an environment variable', () => {
    var runner

    before(() => {
      process.env.THING = 'component'
      runner = new TestRunner({scaffold: 'meta'})
      return runner.start()
    })

    after(() => runner.stop())

    it('works', function () {
      return loadTestFile()
      .evaluate(() => document.querySelector('span').textContent)
      .end()
      .then(text => expect(text).to.equal('I am a component, hear me roar!'))
    })
  })
})
