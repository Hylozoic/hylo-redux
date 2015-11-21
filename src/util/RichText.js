import sanitizeHtml from 'sanitize-html'
import prettyDate from 'pretty-date'
import truncate from 'html-truncate'
import linkify from './linkify'

export function sanitize (text) {
  if (!text) return ''

  // remove leading &nbsp; (a side-effect of contenteditable)
  var strippedText = text.replace(/<p>&nbsp;/gi, '<p>')

  return sanitizeHtml(strippedText, {
    allowedTags: ['a', 'p', 'br', 'ul', 'ol', 'li', 'strong', 'em'],
    allowedAttributes: {
      'a': ['href', 'data-user-id']
    },

    // remove empty paragraphs
    exclusiveFilter: function (frame) {
      return frame.tag === 'p' && !frame.text.trim()
    }
  })
}

export function present (text, opts) {
  if (!text) return '<p></p>'

  // wrap in a <p> tag
  if (text.substring(0, 3) !== '<p>') text = `<p>${text}</p>`

  // make links and hashtags
  text = linkify(text)

  if (opts && opts.maxlength) text = truncate(text, opts.maxlength)

  return text
}

export function humanDate (date, short) {
  var ret = prettyDate.format(typeof date === 'string' ? new Date(date) : date)
  if (short) ret = ret.replace(' ago', '')
  return ret
}
