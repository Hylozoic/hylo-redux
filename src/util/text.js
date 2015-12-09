import sanitizeHtml from 'sanitize-html'
import prettyDate from 'pretty-date'
import truncate from 'html-truncate'
import linkify from './linkify'
import moment from 'moment-timezone'
import marked from 'marked'

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

const sameDay = (t1, t2) =>
  t1.getFullYear() === t2.getFullYear() &&
  t1.getMonth() === t2.getMonth() &&
  t1.getDate() === t2.getDate()

export function timeRange (start, end) {
  let startText = moment(start).calendar(null, {
    sameElse: 'dddd, MMM D, YYYY [at] h:mm A'
  })
  if (!end) {
    return startText
  } else if (sameDay(start, end)) {
    startText = startText.replace(' at ', ' from ')
    let endText = moment(end).format('h:mm A')
    return `${startText} to ${endText}`
  } else {
    return `${startText} to ${moment(end).calendar()}`
  }
}

export function timeRangeFull (start, end) {
  if (!end) {
    return moment(start).format('LLLL')
  } else {
    return moment(start).format('LLLL') + ' to ' + moment(end).format('LLLL')
  }
}

marked.setOptions({
  gfm: true,
  breaks: true,
  sanitize: true
})

export const markdown = marked
