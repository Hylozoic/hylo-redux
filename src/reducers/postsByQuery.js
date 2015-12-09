import { contains, pairs } from 'lodash'
import qs from 'querystring'
import { addIdsToState } from './util'

import {
  CREATE_POST,
  CLEAR_CACHE,
  FETCH_POSTS
} from '../actions'

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  switch (type) {
    case FETCH_POSTS:
      return addIdsToState(state, meta.cache.id, payload.posts)
    case CREATE_POST:
      let post = payload
      let communityIds = post.communities.map(c => c.slug)
      let projectIds = (post.projects || []).map(p => p.id)

      // find all lists that should contain this post id,
      // and prepend it to each of them
      let updatedPostLists = pairs(state).reduce((changedLists, [id, postIds]) => {
        let key = qs.parse(id)

        if ((key.subject === 'community' && contains(communityIds, key.id)) ||
        (key.subject === 'person' && key.id === post.user.id) ||
        (key.subject === 'project' && contains(projectIds, key.id)) ||
        key.subject === 'all-posts') {
          changedLists[id] = [post.id, ...postIds]
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
