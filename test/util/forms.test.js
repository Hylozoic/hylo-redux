require('../support')
import { toggled } from '../../src/util/forms'

describe('toggled', () => {
  it('returns a new object with the value at `path` toggled', () => {
    let obj = {
      a: 1,
      b: 2,
      c: {
        d: {e: false, f: true}
      },
      g: {h: 1}
    }

    let expected = {
      a: 1,
      b: 2,
      c: {
        d: {e: true, f: true}
      },
      g: {h: 1}
    }

    let actual = toggled(obj, 'c.d.e')
    expect(actual).to.deep.equal(expected)
    expect(obj).to.deep.equal(obj)
    expect(actual.c).not.to.equal(obj.c)
    expect(actual.g).not.to.equal(obj.g)
  })
})
