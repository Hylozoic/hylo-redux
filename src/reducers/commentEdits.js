import { get } from 'lodash/fp'
import {
  UPDATE_COMMENT_EDITOR,
  CREATE_COMMENT_PENDING,
  UPDATE_COMMENT
} from '../actions/constants'

export default function (state = {new: {}, edit: {}}, action) {
  const { type, payload, error, meta } = action
  if (error) return state

  switch (type) {
    case UPDATE_COMMENT_EDITOR:
      // payload.bucket will be either 'new' or 'edit'
      return {...state, [payload.bucket]: {...state[payload.bucket], [payload.id]: payload.text}}
    case CREATE_COMMENT_PENDING:
      return {...state, new: {...state.new, [meta.id]: undefined}}
    case UPDATE_COMMENT:
      return {...state, edit: {...state.edit, [meta.id]: undefined}}
  }

  return state
}
