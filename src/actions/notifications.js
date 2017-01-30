import {
  NOTIFY,
  REMOVE_NOTIFICATION
} from '../constants'

export function notify (text, opts) {
  return {
    type: NOTIFY,
    payload: {
      id: Date.now(),
      text,
      type: 'info',
      maxage: 5000,
      ...opts
    }
  }
}

export function removeNotification (id) {
  return {
    type: REMOVE_NOTIFICATION,
    payload: id
  }
}
