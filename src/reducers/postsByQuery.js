import { get } from 'lodash/fp'
import { includes, map, toPairs } from 'lodash'
import qs from 'querystring'
import { appendUniq } from './util'

import {
  CREATE_POST,
  CLEAR_CACHE,
  FETCH_POSTS
} from '../actions'

const matchesCommunity = (key, post, tags) => {
  const communityIds = post.communities.map(c => c.slug).concat(post.communities.map(c => c.id))
  return key.subject === 'community' &&
    (includes(communityIds, key.id) || key.id === 'all') &&
    (!key.tag || includes([post.tag].concat(tags), key.tag))
}

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  switch (type) {
    case FETCH_POSTS:
      return appendUniq(state, meta.cache.id, map(payload.posts, 'id'))
    case CREATE_POST:
      let post = payload

      // find all lists that should contain this post id, and prepend it to each
      // of them
      let updatedPostLists = toPairs(state).reduce((changedLists, [id, postIds]) => {
        let key = qs.parse(id)
        let tags = get('tags', meta) || []

        if ((key.subject === 'person' && key.id === post.user.id) ||
          key.subject === 'all-posts' ||
          matchesCommunity(key, post, tags)) {
          changedLists[id] = [post.id, ...postIds]
        }

        return changedLists
      }, {})
      return {...state, ...updatedPostLists}
    case CLEAR_CACHE:
      if (payload.bucket === 'postsByQuery') {
        return {...state, [payload.id]: null}
      }
      break
  }

  return state
}
