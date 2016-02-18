import {
  CREATE_PROJECT,
  REMOVE_IMAGE,
  UPDATE_NETWORK,
  UPDATE_NETWORK_EDITOR,
  UPLOAD_IMAGE
} from '../actions'
import { updateMedia } from './util'

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  let { subject, id } = meta || {}
  switch (type) {
    case UPDATE_NETWORK_EDITOR:
      return {...state, [id]: {...state[id], ...payload}}
    case UPLOAD_IMAGE:
    case REMOVE_IMAGE:
      if (subject === 'network') {
        return {
          ...state,
          [id]: updateMedia(state[id], 'image', payload)
        }
      }
      break
    case CREATE_PROJECT:
    case UPDATE_NETWORK:
      return {
        ...state,
        [id]: {...state[id], ...payload}
      }
  }

  return state
}
