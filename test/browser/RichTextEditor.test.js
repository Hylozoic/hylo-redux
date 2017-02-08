import { TestRunner } from './support'
import { some } from 'lodash/fp'

describe('RichTextEditor', () => {
  var runner

  before(function () {
    this.timeout(30000)
    runner = new TestRunner({scaffold: 'RichTextEditor'})
    return runner.start()
  })

  after(() => runner.stop())

  it('initializes properly', function () {
    this.timeout(10000)

    return runner.wait(() => window.editorReady)
    .evaluate(() => !!window.tinymce)
    .then(hasTinymce => {
      expect(hasTinymce).to.be.true
      expect(some(m => m.match(/got react-tinymce-\d/), runner.log)).to.be.true
    })
  })
})
