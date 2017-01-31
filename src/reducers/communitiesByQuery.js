import { FETCH_COMMUNITIES } from '../actions/constants'
import { appendUniq } from './util'
import { map } from 'lodash'

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  switch (type) {
    case FETCH_COMMUNITIES:
      return appendUniq(state, meta.cache.id, map(payload.communities, 'slug'))
  }

  return state
}
