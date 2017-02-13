import { tagUrlComponents, userIdFromUrl } from '../routes'
import {
  SHOW_POPOVER,
  HIDE_POPOVER
} from './constants'

/*
  NOTES:
  in any popover, the calling of any 'navigate' action will cause the popover to hide, but
  anything else will not. so if you want to add a different action into a popover besides navigate
  and would like the popover to hide when its called, either add it to the popover reducer
  or also call the 'hidePopover' action
*/

export function showPopoverHandler (dispatch) {
  return function (event) {
    const node = event.target
    const isTag = node.getAttribute('class') === 'hashtag'
    const userId = node.getAttribute('data-user-id') || userIdFromUrl(node.getAttribute('href'))
    if (node.nodeName.toLowerCase() === 'a' && (isTag || userId)) {
      setTimeout(() => {
        if (isTag) {
          const { tagName, slug } = tagUrlComponents(node.getAttribute('href'))
          dispatch(showPopover('tag', {tagName, slug}, node))
        } else {
          dispatch(showPopover('person', {userId}, node))
        }
      }, 500)
    }
  }
}

export function showPopover (type, params, node) {
  return {type: SHOW_POPOVER, payload: {type, params, node}}
}

export function hidePopover () {
  return {type: HIDE_POPOVER}
}
