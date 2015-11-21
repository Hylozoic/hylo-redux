export function viewportTop () {
  if (window.pageYOffset) return window.pageYOffset
  return document.documentElement.clientHeight
  ? document.documentElement.scrollTop
  : document.body.scrollTop
}

export function isAtBottom (offset) {
  return viewportTop() + window.innerHeight >= document.body.scrollHeight - offset
}
