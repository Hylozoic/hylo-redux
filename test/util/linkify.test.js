require('../support')
import linkify from '../../src/util/linkify'

describe('linkify', () => {
  it('works correctly', () => {
    let source = 'hello! http://foo.com and foo@bar.com and ' +
      '<a href="/bar" data-id="3" target="_blank">bar</a> ok great'

    let expected = 'hello! <a href="http://foo.com" class="linkified" ' +
      'target="_blank">http://foo.com</a> and <a href="mailto:foo@bar.com" ' +
      'class="linkified">foo@bar.com</a> and <a href="/bar" data-id="3" ' +
      'target="_blank">bar</a> ok great'

    expect(linkify(source)).to.equal(expected)
  })
})
