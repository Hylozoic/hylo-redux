require('../support')
import { appendInP, humanDate, present, textLength, timeRange } from '../../src/util/text'

describe('appendInP', () => {
  it('works correctly', () => {
    let text = '<p>Some text in a </p>'
    let appendor = '<span>span!</span>'
    let expected = '<p>Some text in a <span>span!</span></p>'

    expect(appendInP(text, appendor)).to.equal(expected)
  })
})

describe('humanDate', () => {
  it('handles a date string', () => {
    const t = new Date(new Date().getTime() - 86400000)
    expect(humanDate(t.toString())).to.equal('yesterday')
  })

  it('omits "ago" if the second argument is true', () => {
    const t = new Date(new Date().getTime() - 15 * 60000)
    expect(humanDate(t, true)).to.equal('15m')
  })

  it('returns "just now" for times in the last minute', () => {
    const t = new Date(new Date().getTime() - 2000)
    expect(humanDate(t)).to.equal('just now')
  })

  it('accepts a blank date', () => {
    expect(humanDate(null)).to.equal('')
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

describe('timeRange', () => {
  it('handles same-day ranges', () => {
    const start = new Date('2015-11-07 16:00')
    const end = new Date('2015-11-07 20:00')
    expect(timeRange(start, end)).to.equal('Saturday, Nov 7, 2015 from 4:00 PM to 8:00 PM')
  })

  it('handles multi-day ranges', () => {
    const start = new Date('2015-11-07 16:00')
    const end = new Date('2015-11-12 20:00')
    expect(timeRange(start, end)).to.equal('Saturday, Nov 7, 2015 at 4:00 PM to Thursday, Nov 12, 2015 at 8:00 PM')
  })

  it('handles a start time without an end time', () => {
    const start = new Date('2015-11-07 16:00')
    expect(timeRange(start)).to.equal('Saturday, Nov 7, 2015 at 4:00 PM')
  })
})

describe('present', () => {
  it('treats <br> tags correctly when truncating', () => {
    const text = '<p>Hi,<br>how are you? Lorem ipsum and <b>all that rot</b></p>'
    const expected = '<p>Hi,<br>how are you? Lorem ipsum and <b>all ...</b></p>'
    expect(present(text, {maxlength: 36})).to.equal(expected)
  })
})
