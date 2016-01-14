import {
  CREATE_PROJECT,
  REMOVE_IMAGE,
  UPDATE_PROJECT,
  UPDATE_PROJECT_EDITOR,
  UPLOAD_IMAGE
} from '../actions'
import { updateMedia } from './util'
import { has } from 'lodash'

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  let { subject, id } = meta || {}
  switch (type) {
    case UPDATE_PROJECT_EDITOR:
      if (has(payload, 'video')) {
        return {
          ...state,
          [id]: updateMedia(state[id], 'video', payload.video)
        }
      }
      return {...state, [id]: {...state[id], ...payload}}
    case UPLOAD_IMAGE:
    case REMOVE_IMAGE:
      if (subject === 'project') {
        return {
          ...state,
          [id]: updateMedia(state[id], 'image', payload)
        }
      }
      break
    case CREATE_PROJECT:
    case UPDATE_PROJECT:
      return {
        ...state,
        [id]: {...state[id], ...payload}
      }
  }

  return state
}
