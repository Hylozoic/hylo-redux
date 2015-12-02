import { flatten, uniq } from 'lodash'
import { debug } from '../util/logging'
import { FETCH_COMMUNITY, FETCH_POST, FETCH_CURRENT_USER } from '../actions'
import { FETCH_POSTS } from '../actions/fetchPosts'

const update = (state, communities) => {
  // merge with existing data so that we don't replace a long list of
  // properties with a shorter one, but we do pick up recent changes
  let mergedCommunities = communities.reduce((m, c) => {
    let id = c.slug
    m[id] = {...state[id], ...c}
    return m
  }, {})

  return {...state, ...mergedCommunities}
}

export default function (state = {}, action) {
  let { error, type, payload } = action
  if (error) return state

  switch (type) {
    case FETCH_COMMUNITY:
      let community = payload
      debug('caching community:', community.slug)
      return {...state, [community.slug]: community}
    case FETCH_POSTS:
      let communities = uniq(flatten(payload.posts.map(p => p.communities)), c => c.id)
      return update(state, communities)
    case FETCH_POST:
      return update(state, payload.communities)
    case FETCH_CURRENT_USER:
      if (payload && payload.memberships) {
        return update(state, payload.memberships.map(m => m.community))
      }
  }

  return state
}
