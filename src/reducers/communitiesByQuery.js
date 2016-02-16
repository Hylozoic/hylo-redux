import { FETCH_COMMUNITIES } from '../actions'
import { addSlugsToState } from './util'

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  switch (type) {
    case FETCH_COMMUNITIES:
      return addSlugsToState(state, meta.cache.id, payload.communities)
  }

  return state
}
