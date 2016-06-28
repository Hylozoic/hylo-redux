import { } from 'lodash'
import {
  UPDATE_COMMENT_EDITOR,
  CREATE_COMMENT
} from '../actions'

export default function (state = {}, action) {
  const { type, payload, error, meta } = action
  if (error) return state

  switch (type) {
    case UPDATE_COMMENT_EDITOR:
      return {...state, [payload.id]: payload.text}
    case CREATE_COMMENT:
      return {...state, [meta.id]: undefined}
  }

  return state
}
