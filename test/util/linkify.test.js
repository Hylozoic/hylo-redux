require('../support')
import linkify, { prepareHashtagsForEditing } from '../../src/util/linkify'

describe('linkify', () => {
  it('works correctly', () => {
    let source = 'hello! http://foo.com and foo@bar.com and ' +
      '<a href="/bar" data-id="3" target="_blank">bar</a> ' +
      '<a href="https://foo.com/bar">ok</a> great'

    let expected = 'hello! <a href="http://foo.com" class="linkified" ' +
      'target="_blank">http://foo.com</a> and ' +
      '<a href="mailto:foo@bar.com" class="linkified">foo@bar.com</a> and ' +
      '<a href="/bar" data-id="3" target="_blank">bar</a> ' +
      '<a href="https://foo.com/bar">ok</a> great'

    expect(linkify(source)).to.equal(expected)
  })

  it('handles <br> tags correctly', () => {
    let source = '<p>hi<br><br>ok</p>'
    let expected = '<p>hi<br><br>ok</p>'
    expect(linkify(source)).to.equal(expected)
  })

  it('wraps unlinked hashtags', () => {
    let source = '<p>and #foo</p>'
    let expected = '<p>and <a href="/tag/foo" class="linkified" data-search="#foo" class="hashtag">#foo</a></p>'
    expect(linkify(source)).to.equal(expected)
  })

  it('adds community slug when wrapping unlinked hashtags', () => {
    let source = '<p>and #foo</p>'
    let slug = 'bar'
    let expected = '<p>and <a href="/c/bar/tag/foo" class="linkified" data-search="#foo" class="hashtag">#foo</a></p>'
    expect(linkify(source, slug)).to.equal(expected)
  })

  it('adds attributes to linked hashtags', () => {
    let source = '<p>and <a>#foo</a></p>'
    let expected = '<p>and <a href="/tag/foo" data-search="#foo" class="hashtag">#foo</a></p>'
    expect(linkify(source)).to.equal(expected)
  })

  it('adds attributes to linked hashtags, including community slug if present', () => {
    let source = '<p>and <a>#foo-bar</a></p>'
    let slug = 'yes'
    let expected = '<p>and <a href="/c/yes/tag/foo-bar" data-search="#foo-bar" class="hashtag">#foo-bar</a></p>'
    expect(linkify(source, slug)).to.equal(expected)
  })
})

describe('prepareHashtagsForEditing', () => {
  it('handles null and blank text', () => {
    expect(prepareHashtagsForEditing(null)).to.equal('')
    expect(prepareHashtagsForEditing('')).to.equal('')
  })

  it('sets data-autocompleting on hashtags', () => {
    const desc = 'hello. <a>#foo</a> and <a>#bar</a> are common nonsense words in code.'
    const expected = 'hello. <a data-autocompleting="true">#foo</a> and <a data-autocompleting="true">#bar</a> are common nonsense words in code.'
    expect(prepareHashtagsForEditing(desc)).to.equal(expected)
  })
})
