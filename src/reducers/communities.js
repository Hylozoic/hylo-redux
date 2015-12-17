import { flatten, uniq, filter, union } from 'lodash'
import { debug } from '../util/logging'
import { FETCH_POSTS, FETCH_COMMUNITY, FETCH_COMMUNITY_SETTINGS, FETCH_COMMUNITY_MODERATORS, FETCH_POST, FETCH_CURRENT_USER, UPLOAD_IMAGE, UPDATE_COMMUNITY_SETTINGS, UPDATE_COMMUNITY_SETTINGS_PENDING, ADD_COMMUNITY_MODERATOR, ADD_COMMUNITY_MODERATOR_PENDING, REMOVE_COMMUNITY_MODERATOR, REMOVE_COMMUNITY_MODERATOR_PENDING } from '../actions'

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
      case ADD_COMMUNITY_MODERATOR:
      case REMOVE_COMMUNITY_MODERATOR:
        return {
          ...state,
          [meta.slug]: {...state[meta.slug], ...meta.prevProps}
        }
      default:
        return state
    }
  }

  let community
  let moderators

  switch (type) {
    case FETCH_COMMUNITY:
    case FETCH_COMMUNITY_SETTINGS:
      let slug = payload.slug || meta.cache.id
      community = {...state[slug], ...payload}
      debug('caching community:', community.slug)
      return {...state, [slug]: community}
    case FETCH_COMMUNITY_MODERATORS:
      community = {...state[meta.cache.id], moderators: payload}
      return {...state, [meta.cache.id]: community}
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
    case ADD_COMMUNITY_MODERATOR_PENDING:
      community = state[meta.slug]
      moderators = community.moderators
      return {...state, [meta.slug]: {...community, moderators: union(moderators, [meta.moderator])}}
    case REMOVE_COMMUNITY_MODERATOR_PENDING:
      community = state[meta.slug]
      moderators = community.moderators
      return {...state, [meta.slug]: {...community, moderators: filter(moderators, m => m.id !== meta.moderatorId)}}
  }

  return state
}
