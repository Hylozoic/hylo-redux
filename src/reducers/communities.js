import { flatten, uniq } from 'lodash'
import { debug } from '../util/logging'
import { FETCH_POSTS, FETCH_COMMUNITY, FETCH_POST, FETCH_CURRENT_USER, UPLOAD_IMAGE, UPDATE_COMMUNITY_SETTINGS, UPDATE_COMMUNITY_SETTINGS_PENDING } from '../actions'

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
  let { error, type, payload, meta } = action
  if (error) {
    switch (type) {
      case UPDATE_COMMUNITY_SETTINGS:
        return {
          ...state,
          [meta.slug]: {...state[meta.slug], ...meta.prevProps}
        }
      default:
        return state
    }
  }

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
      break
    case UPDATE_COMMUNITY_SETTINGS_PENDING:
      let updatedCommunity = [{...state[meta.slug], ...meta.params}]
      return update(state, updatedCommunity)
    case UPLOAD_IMAGE:
      if (meta.subject === 'community-avatar') {
        let updatedCommunity = [{...state[meta.id], avatar_url: payload}]
        return update(state, updatedCommunity)
      } else if (meta.subject === 'community-banner') {
        let updatedCommunity = [{...state[meta.id], banner_url: payload}]
        return update(state, updatedCommunity)
      }
      break
  }

  return state
}
