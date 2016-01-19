import { hashById } from './util'
import { filter } from 'lodash'
import {
  FETCH_ACTIVITY,
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
    case FETCH_ACTIVITY:
      let comments = filter(payload.activities.map(a => a.comment))
      return {
        ...state,
        ...hashById(comments)
      }
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
