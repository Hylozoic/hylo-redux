import { map, get } from 'lodash'
import { appendUniq } from './util'

import {
  FETCH_POSTS
} from '../actions'

export default function (state = {}, action) {
  if (action.error) return state
  if (!get(action, 'meta.staged')) return state

  let { type, payload, meta } = action
  switch (type) {
    case FETCH_POSTS:
      return appendUniq(state, meta.cacheId, map(payload.posts, 'id'))
  }

  return state
}
