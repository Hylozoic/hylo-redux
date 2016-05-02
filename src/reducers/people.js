import { filter, get, merge, pick, find, indexOf, map, sortBy } from 'lodash'
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
  UPDATE_MEMBERSHIP_SETTINGS_PENDING,
  USE_INVITATION
} from '../actions'
import { mergeList } from './util'

const replaceInArray = (arr, oldVal, newVal) => {
  var index = indexOf(arr, oldVal)
  if (index) {
    return arr.slice(0, index)
    .concat([newVal])
    .concat(arr.slice(index + 1))
  } else {
    return arr.concat([newVal])
  }
}

const updateOneMembershipsSettings = (memberships, communityId, settings) => {
  let oldMembership = find(memberships, m => m.community_id === communityId)
  return replaceInArray(
    memberships,
    oldMembership,
    {
      ...oldMembership,
      settings: {
        ...oldMembership.settings,
        ...settings
      }
    })
}

const normalize = person => {
  return {
    ...person,
    recent_request: null,
    recent_offer: null,
    recent_request_id: get(person.recent_request, 'id'),
    recent_offer_id: get(person.recent_offer, 'id')
  }
}

export default function (state = {}, action) {
  let { type, error, payload, meta } = action
  if (error) {
    switch (type) {
      case UPDATE_USER_SETTINGS:
        return {
          ...state,
          current: merge({...state.current}, meta.prevProps),
          [meta.id]: merge({...state[meta.id]}, meta.prevProps)
        }
      case LEAVE_COMMUNITY:
        return {
          ...state,
          current: merge({...state.current}, meta.prevProps)
        }
      case UPDATE_MEMBERSHIP_SETTINGS_PENDING:
        return {
          ...state,
          current: {
            ...state.current,
            memberships: updateOneMembershipsSettings(
              state.current.memberships,
              meta.communityId,
              meta.params.settings
            )
          }
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
      let { params, id } = meta
      return {
        ...state,
        current: {...state.current, ...params},
        [id]: {...state[id], ...params}
      }
    case LEAVE_COMMUNITY_PENDING:
      let memberships = filter(state.current.memberships, m => m.community_id !== meta.communityId)
      return {
        ...state,
        current: {...state.current, memberships}
      }
    case UPDATE_MEMBERSHIP_SETTINGS_PENDING:
      return {
        ...state,
        current: {
          ...state.current,
          memberships: updateOneMembershipsSettings(
            state.current.memberships,
            meta.communityId,
            meta.params.settings
          )
        }
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
        [payload.id]: normalize(payload)
      }
    case LOGIN:
    case SIGNUP:
    case FETCH_CURRENT_USER:
      debug('caching person:', payload.id)
      const normalized = normalize(payload)
      return {
        ...state,
        [payload.id]: normalized,
        current: normalized
      }
    case FETCH_PEOPLE:
      return mergeList(state, payload.people.map(normalize), 'id')
    case CREATE_COMMUNITY:
    case JOIN_COMMUNITY_WITH_CODE:
    case USE_INVITATION:
      return {
        ...state,
        current: {...state.current, memberships: [payload, ...state.current.memberships]}
      }
    case FETCH_ACTIVITY:
      if (meta.resetCount) {
        if (meta.id === 'all') {
          return {
            ...state,
            current: {...state.current, new_notification_count: 0}
          }
        } else {
          return {
            ...state,
            current: {
              ...state.current,
              memberships: map(state.current.memberships, m =>
                m.community.slug === meta.id
                  ? {...m, new_notification_count: 0}
                  : m)
            }
          }
        }
      }
      break
    case FETCH_LIVE_STATUS:
      if (!state.current) return state
      return {
        ...state,
        current: {
          ...state.current,
          new_notification_count: payload.new_notification_count,
          memberships: merge([],
            sortBy(state.current.memberships, 'id'),
            sortBy(payload.memberships, 'id')
          )
        }
      }
  }

  return state
}
