import {
  REGISTER_TOOLTIP,
  UNREGISTER_TOOLTIP,
  RESET_TOOLTIPS
} from '../constants'

export function registerTooltip (id, index) {
  return {type: REGISTER_TOOLTIP, payload: {id, index}}
}

export function unregisterTooltip (id) {
  return {type: UNREGISTER_TOOLTIP, payload: {id}}
}

export function resetTooltips (userId) {
  return {
    type: RESET_TOOLTIPS,
    payload: {api: true, path: `/noo/user/${userId}/reset-tooltips`, method: 'post'}
  }
}
