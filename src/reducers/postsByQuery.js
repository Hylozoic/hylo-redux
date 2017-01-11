import { get } from 'lodash/fp'
import { includes, map, toPairs } from 'lodash'
import qs from 'querystring'
import { appendUniq } from './util'

import {
  APPEND_THREAD,
  CREATE_POST,
  CLEAR_CACHE,
  FETCH_POSTS,
  FIND_OR_CREATE_THREAD
} from '../actions'

const keyMatchesPost = (key, post, tags) => {
  const communityIds = map(post.communities, 'slug').concat(map(post.communities, 'id'))
  return key.subject === 'community' &&
    (includes(communityIds, key.id) || key.id === 'all') &&
    (!key.type || key.type === post.type) &&
    (!key.tag || includes([post.tag].concat(tags), key.tag))
}

const mockState = {
  'subject=community&id=hylo': [
    '123'
  ]
}

export default function (state = mockState, action) {
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
          keyMatchesPost(key, post, tags)) {
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
    case APPEND_THREAD:
    case FIND_OR_CREATE_THREAD:
      return {
        ...state,
        threads: [payload.id, ...(state.threads || [])]
      }
  }

  return state
}
