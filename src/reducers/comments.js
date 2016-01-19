import { hashById } from './util'
import {
  FETCH_COMMENTS,
  CREATE_COMMENT
} from '../actions'

export default function (state = {}, action) {
  let { type, error, payload } = action
  if (error) {
    return state
  }

  // the cases where there isn't a payload
  switch (type) {

  }

  if (!payload) return state

  switch (type) {
    case FETCH_COMMENTS:
      return {
        ...state,
        ...hashById(payload)
      }
    case CREATE_COMMENT:
      return {
        ...state,
        [payload.id]: payload
      }
  }

  return state
}
