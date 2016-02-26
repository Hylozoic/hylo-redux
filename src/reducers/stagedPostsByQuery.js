import { map, get, omit } from 'lodash'
import { appendUniq } from './util'

import {
  FETCH_POSTS,
  MERGE_STAGED_POSTS
} from '../actions'

export default function (state = {}, action) {
  if (action.error) return state
  if (!get(action, 'meta.staged')) return state

  let { type, payload, meta } = action
  switch (type) {
    case FETCH_POSTS:
      return appendUniq(state, meta.cacheId, map(payload.posts, 'id'))
    case MERGE_STAGED_POSTS:
      return omit(state, meta.cacheId)
  }

  return state
}
