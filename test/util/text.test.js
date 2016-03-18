require('../support')
import { appendInP } from '../../src/util/text'

describe('appendInP', () => {
  it('works correctly', () => {
    let text = '<p>Some text in a </p>'
    let appendor = '<span>span!</span>'
    let expected = '<p>Some text in a <span>span!</span></p>'

    expect(appendInP(text, appendor)).to.equal(expected)
  })
})
