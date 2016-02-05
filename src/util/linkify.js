require('linkifyjs/plugins/hashtag')(require('linkifyjs'))
import linkifyString from 'linkifyjs/string'
import cheerio from 'cheerio'
import { isEmpty, pairs } from 'lodash'

var linkifyjsOptions = {
  formatHref: function (value, type) {
    if (type === 'hashtag') {
      return '/search?q=%23' + value.substring(1)
    }
    return value
  },
  linkAttributes: function (value, type) {
    if (type === 'hashtag') return {'data-search': value}
  }
}

// unlike the linkifyjs module, this handles text that may already have html
// tags in it. it does so by generating a DOM from the text and linkifying only
// text nodes that aren't inside A tags.
export default function linkify (text) {
  var $ = cheerio.load(text)

  // caveat: this isn't intended to handle arbitrarily complex html
  var linkifiedHtml = function (node) {
    return node.contents().map((i, el) => {
      if (el.type === 'text') return linkifyString(el.data, linkifyjsOptions)
      if (['a', 'br'].includes(el.name)) return $.html(el)

      var attrs = isEmpty(el.attribs)
        ? ''
        : ' ' + pairs(el.attribs).map(([k, v]) => `${k}='${v}'`).join(' ')

      return `<${el.name}${attrs}>${linkifiedHtml($(el))}</${el.name}>`
    }).get().join('')
  }

  return linkifiedHtml($.root())
}
