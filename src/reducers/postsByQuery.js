import { appendUniq } from './util'
import { contains, pairs } from 'lodash'
import qs from 'querystring'

import {
  FETCH_POSTS,
  CREATE_POST,
  CLEAR_CACHE
} from '../actions'

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  switch (type) {
    case FETCH_POSTS:
      return appendUniq(state, meta.cache.id, payload.posts)
    case CREATE_POST:
      let slugs = payload.communities.map(c => c.slug)
      let updatedPostLists = pairs(state).reduce((changedLists, [id, posts]) => {
        let key = qs.parse(id)

        if ((key.subject === 'community' && contains(slugs, key.id)) ||
        (key.subject === 'person' && key.id === payload.user_id) ||
        key.subject === 'all-posts') {
          changedLists[id] = [payload].concat(posts)
        }

        return changedLists
      }, {})
      return {...state, ...updatedPostLists}
    case CLEAR_CACHE:
      if (payload.bucket === 'postsByCommunity') {
        return {...state, [payload.id]: null}
      }
  }

  return state
}
