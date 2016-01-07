export function viewportTop () {
  if (window.pageYOffset) return window.pageYOffset
  return document.documentElement.clientHeight
  ? document.documentElement.scrollTop
  : document.body.scrollTop
}

export function isAtBottom (offset) {
  return viewportTop() + window.innerHeight >= document.body.scrollHeight - offset
}

export function changeViewportTop (delta) {
  return window.scrollTo(0, viewportTop() + delta)
}

export function position (element) {
  let x = 0
  let y = 0

  while (element) {
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
