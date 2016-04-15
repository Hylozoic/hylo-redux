require('linkifyjs/plugins/hashtag')(require('linkifyjs'))
import linkifyString from 'linkifyjs/string'
import cheerio from 'cheerio'
import { isEmpty, toPairs } from 'lodash'

export function hashtagHref (tagName, slug) {
  return slug
  ? `/c/${slug}/tag/${tagName}`
  : `/tag/${tagName}`
}

// this handles old-style hashtags, which aren't wrapped in tags
var linkifyjsOptions = {
  formatHref: function (value, type) {
    if (type === 'hashtag') {
      return '/tag/' + value.substring(1)
    }
    return value
  },
  linkAttributes: function (value, type) {
    if (type === 'hashtag') return {'data-search': value, class: 'hashtag'}
  }
}

// unlike the linkifyjs module, this handles text that may already have html
// tags in it. it does so by generating a DOM from the text and linkifying only
// text nodes that aren't inside A tags.
export default function linkify (text, slug) {
  var $ = cheerio.load(text)

  // caveat: this isn't intended to handle arbitrarily complex html
  var run = node =>
    node.contents().map((i, el) => {
      if (el.type === 'text') return linkifyString(el.data, linkifyjsOptions)
      if (el.name === 'br') return $.html(el)
      if (el.name === 'a') return setHashtagAttributes($, el, slug)
      return recurse($, el, run)
    }).get().join('')

  return run($.root())
}

function setHashtagAttributes ($, el, slug) {
  const $el = $(el)
  const match = $el.text().match(/^(#(\w+))$/)
  if (match) {
    $el.attr('href', hashtagHref(match[2], slug))
    $el.attr('data-search', match[1])
    $el.attr('class', 'hashtag')
  }
  return $.html(el)
}

function recurse ($, el, fn) {
  const attrs = !isEmpty(el.attribs)
    ? ' ' + toPairs(el.attribs).map(([k, v]) => `${k}='${v}'`).join(' ')
    : ''

  return `<${el.name}${attrs}>${fn($(el))}</${el.name}>`
}

export function prepareHashtagsForEditing (text) {
  var $ = cheerio.load(text)
  $('a').each((i, el) => {
    const $el = $(el)
    const match = $el.text().match(/^(#(\w+))$/)
    if (match) $el.attr('data-autocompleting', true)
  })
  return $.html()
}
