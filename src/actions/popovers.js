import {
  SHOW_POPOVER,
  HIDE_POPOVER
} from './constants'

export function showPopover (type, params, node) {
  return {type: SHOW_POPOVER, payload: {type, params, node}}
}

export function hidePopover () {
  return {type: HIDE_POPOVER}
}
