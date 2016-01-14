import { filter } from 'lodash'
import { debug } from '../util/logging'
import {
  CREATE_COMMUNITY,
  LOGIN,
  LOGOUT,
  FETCH_PEOPLE,
  FETCH_CURRENT_USER,
  FETCH_PERSON,
  SIGNUP,
  UPDATE_USER_SETTINGS,
  UPDATE_USER_SETTINGS_PENDING,
  LEAVE_COMMUNITY,
  LEAVE_COMMUNITY_PENDING
} from '../actions'
import { mergeList } from './util'

export default function (state = {}, action) {
  let { type, error, payload, meta } = action
  if (error) {
    switch (type) {
      case UPDATE_USER_SETTINGS:
        return {
          ...state,
          current: {...state.current, ...meta.prevProps}
        }
      case LEAVE_COMMUNITY:
        return {
          ...state,
          current: {...state.current, ...meta.prevProps}
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
      return {
        ...state,
        current: {...state.current, ...meta.params}
      }
    case LEAVE_COMMUNITY_PENDING:
      let memberships = filter(state.current.memberships, m => m.community_id !== meta.communityId)
      return {
        ...state,
        current: {...state.current, memberships}
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
      return {
        ...state,
        current: {...state.current, memberships: [payload, ...state.current.memberships]}
      }
  }

  return state
}
