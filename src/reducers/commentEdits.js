import { } from 'lodash'
import {
  UPDATE_COMMENT_EDITOR,
  CREATE_COMMENT,
  UPDATE_COMMENT
} from '../constants'

export default function (state = {new: {}, edit: {}}, action) {
  const { type, payload, error, meta } = action
  if (error) return state

  switch (type) {
    case UPDATE_COMMENT_EDITOR:
      // payload.bucket will be either 'new' or 'edit'
      return {...state, [payload.bucket]: {...state[payload.bucket], [payload.id]: payload.text}}
    case CREATE_COMMENT:
      return {...state, new: {...state.new, [meta.id]: undefined}}
    case UPDATE_COMMENT:
      return {...state, edit: {...state.edit, [meta.id]: undefined}}
  }

  return state
}
