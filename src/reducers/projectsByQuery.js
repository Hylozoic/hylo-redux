import { FETCH_PROJECTS } from '../actions'
import { appendUniq } from './util'
import { map } from 'lodash'

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  switch (type) {
    case FETCH_PROJECTS:
      return appendUniq(state, meta.cache.id, map(payload.projects, 'id'))
  }

  return state
}
