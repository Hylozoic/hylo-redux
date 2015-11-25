import { appendUniq } from './util'

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
      return appendUniq(state, meta.query, payload.posts)
    case CREATE_POST:
      let updatedCommunities = payload.communities.reduce((m, c) => {
        if (state[c.slug]) {
          m[c.slug] = [payload].concat(state[c.slug])
        }
        return m
      }, {})
      return {...state, ...updatedCommunities}
    case CLEAR_CACHE:
      if (payload.bucket === 'postsByCommunity') {
        return {...state, [payload.id]: null}
      }
  }

  return state
}
