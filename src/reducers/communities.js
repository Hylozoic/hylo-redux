import { flatten, uniq, filter, merge, union, omit } from 'lodash'
import { debug } from '../util/logging'
import {
  CREATE_COMMUNITY,
  FETCH_POSTS,
  FETCH_COMMUNITY,
  FETCH_COMMUNITY_FOR_INVITATION,
  FETCH_COMMUNITY_SETTINGS,
  FETCH_COMMUNITY_MODERATORS,
  FETCH_COMMUNITIES,
  FETCH_POST,
  FETCH_CURRENT_USER,
  UPDATE_COMMUNITY_SETTINGS,
  UPDATE_COMMUNITY_SETTINGS_PENDING,
  ADD_COMMUNITY_MODERATOR,
  ADD_COMMUNITY_MODERATOR_PENDING,
  REMOVE_COMMUNITY_MODERATOR,
  REMOVE_COMMUNITY_MODERATOR_PENDING,
  TYPEAHEAD,
  USE_INVITATION
} from '../actions'
import { mergeList } from './util'

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

  let moderators

  switch (type) {
    case FETCH_COMMUNITY:
    case FETCH_COMMUNITY_SETTINGS:
      let slug = payload.slug || meta.cache.id
      community = {...state[slug], ...payload}
      debug('caching community:', community.slug)
      return {...state, [slug]: community}
    case FETCH_COMMUNITY_FOR_INVITATION:
      return {...state, [meta.token]: payload}
    case USE_INVITATION:
      return {...state, [meta.token]: payload.community}
    case FETCH_COMMUNITY_MODERATORS:
      community = {...state[meta.cache.id], moderators: payload}
      return {...state, [meta.cache.id]: community}
    case FETCH_POSTS:
      let communities = uniq(flatten(payload.posts.map(p => p.communities)), c => c.id)
      return mergeList(state, communities, 'slug')
    case FETCH_POST:
      return mergeList(state, payload.communities, 'slug')
    case FETCH_CURRENT_USER:
      if (payload && payload.memberships) {
        return mergeList(state, payload.memberships.map(m => m.community), 'slug')
      }
      break
    case UPDATE_COMMUNITY_SETTINGS_PENDING:
      if (meta.params.active === false) {
        return omit(state, meta.slug)
      }
      return {
        ...state,
        [meta.slug]: merge({...state[meta.slug]}, meta.params)
      }
    case ADD_COMMUNITY_MODERATOR_PENDING:
      community = state[meta.slug]
      moderators = community.moderators
      return {...state, [meta.slug]: {...community, moderators: union(moderators, [meta.moderator])}}
    case REMOVE_COMMUNITY_MODERATOR_PENDING:
      community = state[meta.slug]
      moderators = community.moderators
      return {...state, [meta.slug]: {...community, moderators: filter(moderators, m => m.id !== meta.moderatorId)}}
    case CREATE_COMMUNITY:
      let community = payload.community
      return {
        ...state,
        [community.slug]: community
      }
    case FETCH_COMMUNITIES:
      return mergeList(state, payload.communities, 'slug')
    case TYPEAHEAD:
      if (meta.id === 'network_communities') {
        return mergeList(state, payload, 'slug')
      }
  }
  return state
}
