require('../support')
import { appendInP, textLength } from '../../src/util/text'

describe('appendInP', () => {
  it('works correctly', () => {
    let text = '<p>Some text in a </p>'
    let appendor = '<span>span!</span>'
    let expected = '<p>Some text in a <span>span!</span></p>'

    expect(appendInP(text, appendor)).to.equal(expected)
  })
})

describe('textLength', () => {
  it('returns the length of the text in an HTML string', () => {
    expect(textLength('foo')).to.equal(3)
    expect(textLength('f<b>o</b>o')).to.equal(3)
    expect(textLength('<p>f<b>o</b>o bar</p>')).to.equal(7)
    expect(textLength('<p class="ok">f<b><em like="what">oo</em></b>o and bar</p>')).to.equal(12)
  })
})
