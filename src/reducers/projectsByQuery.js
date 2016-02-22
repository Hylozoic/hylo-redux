import { FETCH_PROJECTS } from '../actions'
import { addIdsToState } from './util'

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  switch (type) {
    case FETCH_PROJECTS:
      return addIdsToState(state, meta.cache.id, payload.projects)
  }

  return state
}
