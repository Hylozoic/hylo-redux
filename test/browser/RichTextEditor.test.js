import { loadTestFile, useTestFileScaffold, removeTestFile } from './support'
import { some } from 'lodash/fp'

describe('RichTextEditor', () => {
  before(function () {
    this.timeout(10000)
    return useTestFileScaffold('RichTextEditor')
  })
  after(() => removeTestFile())

  it('initializes properly', function () {
    this.timeout(10000)
    const logs = []
    return loadTestFile(n => n.on('console', (type, ...args) => {
      if (type === 'log') logs.push(args[0])
    }))
    .wait(() => window.tinymce)
    .evaluate(() => window.editorReady)
    .end()
    .then(ready => {
      expect(ready).to.be.true
      expect(some(m => m.match(/got react-tinymce-\d/), logs)).to.be.true
    })
  })
})
