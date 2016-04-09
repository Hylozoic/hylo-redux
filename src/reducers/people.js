import { filter, merge, pick, find, indexOf } from 'lodash'
import { debug } from '../util/logging'
import {
  CREATE_COMMUNITY,
  FETCH_ACTIVITY,
  FETCH_CURRENT_USER,
  FETCH_LIVE_STATUS,
  FETCH_PEOPLE,
  FETCH_PERSON,
  JOIN_COMMUNITY_WITH_CODE,
  LEAVE_COMMUNITY_PENDING,
  LEAVE_COMMUNITY,
  LOGIN,
  LOGOUT,
  SIGNUP,
  UPDATE_USER_SETTINGS_PENDING,
  UPDATE_USER_SETTINGS,
  UPDATE_COMMUNITY_SETTINGS_PENDING,
  USE_INVITATION
} from '../actions'
import { mergeList } from './util'

var replaceInArray = (arr, oldVal, newVal) => {
  var index = indexOf(arr, oldVal)
  if (index) {
    return arr.slice(0, index)
    .concat([newVal])
    .concat(arr.slice(index + 1))
  } else {
    return arr.concat([newVal])
  }
}

export default function (state = {}, action) {
  let { type, error, payload, meta } = action
  if (error) {
    switch (type) {
      case UPDATE_USER_SETTINGS:
        return {
          ...state,
          current: merge({...state.current}, meta.prevProps)
        }
      case LEAVE_COMMUNITY:
        return {
          ...state,
          current: merge({...state.current}, meta.prevProps)
        }
      default:
        return state
    }
  }

  // the cases where there isn't a payload
  switch (type) {
    case LOGOUT:
      let currentUser = state.current
      if (!currentUser) return state

      debug('un-caching person:', currentUser.id)
      return {
        ...state,
        current: null,
        [currentUser.id]: null
      }
    case UPDATE_USER_SETTINGS_PENDING:
      let { params } = meta
      return {
        ...state,
        current: {...state.current, ...params},
        [params.id]: {...state[params.id], ...params}
      }
    case LEAVE_COMMUNITY_PENDING:
      let memberships = filter(state.current.memberships, m => m.community_id !== meta.communityId)
      return {
        ...state,
        current: {...state.current, memberships}
      }
    case UPDATE_COMMUNITY_SETTINGS_PENDING:
      if (meta.params.active === false) {
        memberships = filter(state.current.memberships, m => m.community.slug !== meta.params.slug)
        return {
          ...state,
          current: {...state.current, memberships}
        }
      }

      var oldMembership = find(state.current.memberships, m => m.community.slug === meta.params.slug)
      var newMembership = {
        ...oldMembership,
        community: {...oldMembership.community, ...pick(meta.params, 'name', 'slug', 'avatar_url')}
      }

      return {
        ...state,
        current: {
          ...state.current,
          memberships: replaceInArray(state.current.memberships, oldMembership, newMembership)
        }
      }

  }

  if (!payload) return state

  switch (type) {
    case FETCH_PERSON:
      debug('caching person:', payload.id)
      return {
        ...state,
        [payload.id]: payload
      }
    case LOGIN:
    case SIGNUP:
    case FETCH_CURRENT_USER:
      debug('caching person:', payload.id)
      return {
        ...state,
        [payload.id]: payload,
        current: payload
      }
    case FETCH_PEOPLE:
      return mergeList(state, payload.people, 'id')
    case CREATE_COMMUNITY:
    case JOIN_COMMUNITY_WITH_CODE:
    case USE_INVITATION:
      return {
        ...state,
        current: {...state.current, memberships: [payload, ...state.current.memberships]}
      }
    case FETCH_ACTIVITY:
      if (meta.resetCount) {
        return {
          ...state,
          current: {...state.current, new_notification_count: 0}
        }
      }
      break
    case FETCH_LIVE_STATUS:
      if (!state.current) return state
      return {
        ...state,
        current: {...state.current, new_notification_count: payload.new_notification_count}
      }
  }

  return state
}
