import {
  REMOVE_IMAGE,
  UPDATE_NETWORK,
  UPDATE_NETWORK_EDITOR,
  UPLOAD_IMAGE
} from '../constants'

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  let { subject, id } = meta || {}
  switch (type) {
    case UPDATE_NETWORK_EDITOR:
      return {...state, [id]: {...state[id], ...payload}}
    case UPLOAD_IMAGE:
    case REMOVE_IMAGE:
      if (subject === 'network-avatar') {
        return {
          ...state,
          [id]: {...state[id], avatar_url: payload}
        }
      } else if (subject === 'network-banner') {
        return {
          ...state,
          [id]: {...state[id], banner_url: payload}
        }
      }
      break
    case UPDATE_NETWORK:
      return {
        ...state,
        [id]: {...state[id], ...payload}
      }
  }

  return state
}
