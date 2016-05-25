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

export function present (text, opts = {}) {
  if (!text) return ''

  // wrap in a <p> tag
  if (text.substring(0, 3) !== '<p>') text = `<p>${text}</p>`

  // make links and hashtags
  text = linkify(text, opts.slug)

  if (opts && opts.maxlength) text = truncate(text, opts.maxlength)

  return text
}

export function appendInP (text, appendee) {
  text = text.trim()
  if (text.substr(text.length - 4) === '</p>') {
    return text.substr(0, text.length - 4) + appendee + '</p>'
  } else {
    return text + appendee
  }
}

export function prependInP (text, prependee) {
  text = text.trim()
  if (text.substr(0, 3) === '<p>') {
    return '<p>' + prependee + text.substr(3)
  } else {
    return prependee + text
  }
}

export function humanDate (date, short) {
  var ret = date
    ? prettyDate.format(typeof date === 'string' ? new Date(date) : date)
    : ''
  if (short) {
    ret = ret.replace(' ago', '')
  } else {
    // this workaround prevents a "React attempted to use reuse markup" error
    // which happens if the timestamp is less than 1 minute ago, because the
    // server renders "N seconds ago", but by the time React is loaded on the
    // client side, it's "N+1 seconds ago"
    let match = ret.match(/(\d+) seconds? ago/)
    if (match) {
      if (Number(match[1]) >= 50) return '1m ago'
      return 'just now'
    }
  }
  ret = ret.replace(/ minutes?/, 'm')
  .replace(/ hours?/, 'h')
  .replace(/ days?/, 'd')
  .replace(/ weeks?/, 'w')
  .replace(/ month(s?)/, ' mo$1')
  return ret
}

const sameDay = (t1, t2) =>
  t1.getFullYear() === t2.getFullYear() &&
  t1.getMonth() === t2.getMonth() &&
  t1.getDate() === t2.getDate()

export function timeRange (start, end) {
  const calendarOptions = {
    sameElse: 'dddd, MMM D, YYYY [at] h:mm A'
  }
  let startText = moment(start).calendar(null, calendarOptions)
  if (!end) {
    return startText
  } else if (sameDay(start, end)) {
    startText = startText.replace(' at ', ' from ')
    let endText = moment(end).format('h:mm A')
    return `${startText} to ${endText}`
  } else {
    return `${startText} to ${moment(end).calendar(null, calendarOptions)}`
  }
}

export function timeRangeBrief (start, end) {
  return moment(start).calendar(null, {sameElse: 'MMM D'}) +
  (end && !sameDay(start, end)
    ? ' - ' + moment(end).calendar(null, {sameElse: 'MMM D'})
    : '')
}

export function timeRangeFull (start, end) {
  if (!end) {
    return moment(start).format('LLLL')
  } else {
    return moment(start).format('LLLL') + ' to ' + moment(end).format('LLLL')
  }
}

export function formatDate (date) {
  var dateObj = (typeof date === 'string' ? new Date(date) : date)
  return `${dateObj.toLocaleString('en-us', { month: 'long' })} ${dateObj.getDate()}, ${dateObj.getFullYear()}`
}

marked.setOptions({
  gfm: true,
  breaks: true,
  sanitize: true
})

export const markdown = marked

export function nonbreaking (str) {
  return str.replace(/ /g, String.fromCharCode(160))
}

export function textLength (html) {
  return html.replace(/<[^>]+>/g, '').length
}
