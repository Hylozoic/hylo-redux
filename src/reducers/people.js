import { composeReducers } from './util'
import { filter, get, mergeWith, find, indexOf } from 'lodash'
import { isNull, omitBy } from 'lodash/fp'
import { debug } from '../util/logging'
import {
  ADD_DATA_TO_STORE,
  CREATE_COMMUNITY,
  FETCH_ACTIVITY,
  FETCH_CURRENT_USER,
  FETCH_LIVE_STATUS,
  FETCH_PEOPLE,
  FETCH_PERSON,
  JOIN_COMMUNITY_WITH_CODE,
  LEAVE_COMMUNITY_PENDING,
  LOGIN,
  LOGOUT,
  SIGNUP,
  UPDATE_USER_SETTINGS_PENDING,
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
  return omitBy(isNull, {
    ...person,
    recent_request: null,
    recent_offer: null,
    recent_request_id: get(person.recent_request, 'id'),
    recent_offer_id: get(person.recent_offer, 'id'),
    left_nav_tags: null,
    people: null,
    communities: null
  })
}

const updateCurrentUser = (user, params) =>
  mergeWith({...user}, params, (objV, srcV, key, obj, src) => {
    if (key === 'tags') return srcV
  })

const normalizeMembership = membership => omitBy(isNull, {
  ...membership,
  community: null,
  left_nav_tags: null
})

const peopleReducer = (state = {}, action) => {
  const { type, error, payload, meta } = action
  if (error) return state

  // the cases where there isn't a payload
  switch (type) {
    case UPDATE_USER_SETTINGS_PENDING:
      let { params } = meta
      const newCurrentUser = updateCurrentUser(state.current, params)
      return {
        ...state,
        current: newCurrentUser,
        [state.current.id]: newCurrentUser
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
        memberships = filter(state.current.memberships, m => m.community_id !== meta.id)
        return {
          ...state,
          current: {...state.current, memberships}
        }
      }
  }

  if (!payload) return state

  switch (type) {
    case ADD_DATA_TO_STORE:
      if (meta.bucket === 'people') {
        return mergeList(state, payload.map(normalize), 'id')
      }
      break
    case FETCH_PERSON:
      debug('caching person:', payload.id)
      return {
        ...state,
        [payload.id]: {...state[payload.id], ...normalize(payload)}
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
      return mergeList(state, payload.items.map(normalize), 'id')
    case CREATE_COMMUNITY:
    case JOIN_COMMUNITY_WITH_CODE:
    case USE_INVITATION:
      return {
        ...state,
        current: {...state.current, memberships: [
          normalizeMembership(payload),
          ...state.current.memberships
        ]}
      }
    case FETCH_ACTIVITY:
      if (meta.resetCount) {
        return {
          ...state,
          current: {...state.current, new_notification_count: 0}
        }
      }
      break

  }

  return state
}

const currentUserReducer = (state = null, action) => {
  const { error, payload, type } = action
  if (error) return state

  switch (type) {
    case LOGOUT:
      return null
    case FETCH_LIVE_STATUS:
      const { new_notification_count } = payload
      return {...state, new_notification_count}
  }

  return state
}

export default composeReducers(
  peopleReducer,
  (state = {}, action) => {
    const newState = currentUserReducer(state.current, action)
    if (newState !== state.current) {
      return {...state, current: newState}
    }
    return state
  }
)
