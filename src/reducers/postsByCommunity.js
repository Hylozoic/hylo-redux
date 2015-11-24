import { appendUniq } from './util'

import {
  FETCH_POSTS,
  CREATE_POST
} from '../actions'

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  switch (type) {
    case FETCH_POSTS:
      if (meta.subject === 'community') {
        return appendUniq(state, meta.id, payload.posts)
      }
      break
    case CREATE_POST:
      let updatedCommunities = payload.communities.reduce((m, c) => {
        if (state[c.slug]) {
          m[c.slug] = [payload].concat(state[c.slug])
        }
        return m
      }, {})
      return {...state, ...updatedCommunities}
  }

  return state
}
