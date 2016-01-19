import { uniq } from 'lodash'

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
        let existing = state[meta.id] || []
        return {
          ...state,
          [meta.id]: uniq(existing.concat(payload.map(c => c.id)))
        }
      }
      break
    case CREATE_COMMENT:
      let existing = state[meta.id] || []
      return {
        ...state,
        [meta.id]: uniq(existing.concat([payload.id]))
      }
  }

  return state
}
