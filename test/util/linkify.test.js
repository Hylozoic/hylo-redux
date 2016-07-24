require('../support')
import linkify, { prepareHashtagsForEditing, findUrls } from '../../src/util/linkify'

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

  it('does not linkify hash fragments in URLs as hashtags', () => {
    const source = '<p>ok http://foo.com/#bar yes?</p>'
    const expected = '<p>ok <a href="http://foo.com/#bar" class="linkified" target="_blank">http://foo.com/#bar</a> yes?</p>'
    expect(linkify(source)).to.equal(expected)
  })

  it('shortens long URLs', () => {
    const longUrl = 'http://www.nirandfar.com/2016/07/three-steps-get-speed-subject-quickly.html?goal=0_9f67e23487-01de31333b-97733697&mc_cid=01de31333b&mc_eid=edfd8b3847'
    const shortUrl = longUrl.slice(0, 48)
    const source = `<p>${longUrl} and <a href="meow">${longUrl}</a></p>`
    const expected = `<p><a href="${longUrl}" class="linkified" target="_blank">${shortUrl + '…'}</a> and <a href="meow">${shortUrl + '&#x2026;'}</a></p>`
    expect(linkify(source)).to.equal(expected)
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

describe('findUrls', () => {
  it('finds urls', () => {
    const text = '<p>http://foo.com</p>\n</p>https://bar.com/foo#zing https://zing.com/whee</p>'
    expect(findUrls(text)).to.deep.equal([
      'http://foo.com',
      'https://bar.com/foo#zing',
      'https://zing.com/whee'
    ])
  })
})
