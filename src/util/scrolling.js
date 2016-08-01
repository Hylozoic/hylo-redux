import { has } from 'lodash'

const bottomScrollPosition = () =>
  document.body.scrollHeight - window.innerHeight

export const viewportTop = () =>
  has(window, 'pageYOffset')
    ? window.pageYOffset
    : document.documentElement.clientHeight
      ? document.documentElement.scrollTop
      : document.body.scrollTop

export const isAtBottom = (offset, element) =>
  (!element || element === window)
    ? viewportTop() >= bottomScrollPosition() - offset
    : element.scrollTop >= element.scrollHeight - element.offsetHeight - offset

export function scrollToBottom () {
  return window.scrollTo(0, bottomScrollPosition())
}

export function changeViewportTop (delta) {
  return window.scrollTo(0, viewportTop() + delta)
}

export function position (element, parent) {
  let x = 0
  let y = 0

  while (element && element !== parent) {
    x += element.offsetLeft + element.clientLeft
    y += element.offsetTop + element.clientTop
    element = element.offsetParent
  }

  return {x, y}
}

export function positionInViewport (element) {
  let x = 0
  let y = 0

  while (element) {
    x += element.offsetLeft - element.scrollLeft + element.clientLeft
    y += element.offsetTop - element.scrollTop + element.clientTop
    element = element.offsetParent
  }

  return {x, y}
}

export function scrollToAnchor (anchor, padding = 0, parent) {
  let element = (parent || document).querySelector(`[name='${anchor}']`)
  if (parent) {
    parent.scrollTop = position(element, parent).y - padding
  } else {
    window.scrollTo(0, position(element).y - padding)
  }
}

export const scrollToComment = (commentId, parent) => {
  // show the comment in the upper middle area of the viewport
  const padding = document.documentElement.clientHeight / 4
  return scrollToAnchor(`comment-${commentId}`, padding, parent)
}
