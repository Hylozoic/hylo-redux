import truncate from 'trunc-html'
import { filter } from 'lodash/fp'

export const ogMetaTags = (title, description, image) => {
  var metaTags = {
    'og:title': title,
    'og:description': truncate(description || '', 140).text
  }
  if (image) {
    metaTags = {...metaTags,
      'og:image': image.url,
      'og:image:width': image.width,
      'og:image:height': image.height
    }
  }
  return metaTags
}

export const isInCommunity = ({ pathname }) => pathname.startsWith('/c/')

export const findChildLink = element => {
  if (element.nodeName === 'A') return element
  if (element.hasChildNodes()) {
    const mappedNodes = []
    for (var i = 0; i < element.childNodes.length; i++) {
      mappedNodes.push(findChildLink(element.childNodes[i]))
    }
    return filter(id => id, mappedNodes)[0]
  }
  return false
}

export const dispatchEvent = (el, etype) => {
  var evObj = document.createEvent('Events')
  evObj.initEvent(etype, true, false)
  el.dispatchEvent(evObj)
}

export const coinToss = () =>
  Math.floor(Math.random() * 2) === 0

export const tapLog = message => d => {
  console.log(message, d)
  return d
}
