import { appendUniq } from './util'
import {
  FETCH_COMMENTS,
  CREATE_COMMENT
} from '../actions'

export default function (state = {}, action) {
  let { type, error, payload, meta } = action
  if (error) {
    return state
  }

  switch (type) {
    case FETCH_COMMENTS:
      if (meta.subject === 'post') {
        return appendUniq(state, meta.id, payload)
      }
      break
    case CREATE_COMMENT:
      return appendUniq(state, meta.id, [payload])
  }

  return state
}
