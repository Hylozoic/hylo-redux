import { FETCH_COMMUNITIES } from '../actions'
import { addIdsToState } from './util'

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  switch (type) {
    case FETCH_COMMUNITIES:
      return addIdsToState(state, meta.cache.id, payload.projects)
  }

  return state
}
