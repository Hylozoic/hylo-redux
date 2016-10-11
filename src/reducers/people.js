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
      if (payload) return {...state, [payload.id]: normalize(payload)}
      break
    case FETCH_PEOPLE:
      return mergeList(state, payload.items.map(normalize), 'id')
  }

  return state
}

const currentUserReducer = (state = null, action) => {
  const { error, payload, type, meta } = action
  if (error) return state

  if (type === LEAVE_COMMUNITY_PENDING ||
    (type === UPDATE_COMMUNITY_SETTINGS_PENDING && meta.params.active === false)) {
    return {
      ...state,
      memberships: filter(state.memberships, m => m.community_id !== meta.id)
    }
  }

  switch (type) {
    case LOGOUT:
      return null
    case LOGIN:
    case SIGNUP:
    case FETCH_CURRENT_USER:
      return payload ? normalize(payload) : null
    case CREATE_COMMUNITY:
    case JOIN_COMMUNITY_WITH_CODE:
    case USE_INVITATION:
      return {
        ...state,
        memberships: [normalizeMembership(payload), ...state.memberships]
      }
    case FETCH_ACTIVITY:
      return meta.resetCount ? {...state, new_notification_count: 0} : state
    case FETCH_LIVE_STATUS:
      const { new_notification_count } = payload
      return {...state, new_notification_count}
    case UPDATE_MEMBERSHIP_SETTINGS_PENDING:
      return {
        ...state,
        memberships: updateOneMembershipsSettings(
          state.memberships,
          meta.communityId,
          meta.params.settings
        )
      }
    case UPDATE_USER_SETTINGS_PENDING:
      return updateCurrentUser(state, meta.params)
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
