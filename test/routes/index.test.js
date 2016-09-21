import { tagUrlComponents } from '../../src/routes'

describe('tagUrlComponents', () => {
  it('works with a community url', () => {
    const parsed = tagUrlComponents('/c/foo/tag/request')
    expect(parsed.tagName).to.equal('request')
    expect(parsed.slug).to.equal('foo')
  })

  it('works with a non-community url', () => {
    expect(tagUrlComponents('/tag/request').tagName).to.equal('request')
  })
})
