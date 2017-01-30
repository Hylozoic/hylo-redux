import { get } from 'lodash/fp'
import {
  LOGIN,
  SET_LOGIN_ERROR,
  CONTINUE_LOGIN,
  FINISH_LOGIN,
  LOGOUT,
  SIGNUP,
  SET_SIGNUP_ERROR,
  GENERATE_USER_TOKEN,
  REVOKE_USER_TOKEN,
  TOGGLE_USER_SETTINGS_SECTION,
  UPDATE_MEMBERSHIP_SETTINGS,
  UPDATE_CURRENT_USER,
  FETCH_CURRENT_USER,
  SET_PASSWORD
} from '../constants'

import { setCurrentCommunityId } from './ui'

// this is a client-only action
export function login (email, password) {
  return {
    type: LOGIN,
    payload: {api: true, path: '/login', params: {email, password}, method: 'post'},
    meta: {
      addDataToStore: {
        people: get('people'),
        communities: get('communities')
      }
    }
  }
}

export function setLoginError (message) {
  return {type: SET_LOGIN_ERROR, payload: message}
}

export function continueLogin (query) {
  return {type: CONTINUE_LOGIN, payload: query}
}

export function finishLogin () {
  return {type: FINISH_LOGIN}
}

export function logout () {
  return {
    type: LOGOUT,
    payload: {api: true, path: '/logout', method: 'post'}
  }
}

export function signup (name, email, password) {
  let params = {name, email, password, resp: 'user', login: true}
  return {
    type: SIGNUP,
    payload: {api: true, path: '/noo/user', params, method: 'post'},
    meta: {
      addDataToStore: {
        people: get('people'),
        communities: get('communities')
      }
    }
  }
}

export function setSignupError (message) {
  return {type: SET_SIGNUP_ERROR, payload: message}
}

export function generateUserToken () {
  return {
    type: GENERATE_USER_TOKEN,
    payload: {api: true, path: '/noo/access-token', method: 'post'}
  }
}

export function revokeUserToken () {
  return {
    type: REVOKE_USER_TOKEN,
    payload: {api: true, path: '/noo/access-token/revoke', method: 'delete'}
  }
}

export function toggleUserSettingsSection (sectionName, forceOpen) {
  return {
    type: TOGGLE_USER_SETTINGS_SECTION,
    payload: sectionName,
    meta: {forceOpen}
  }
}

// currentUser

export function updateMembershipSettings (communityId, params) {
  return {
    type: UPDATE_MEMBERSHIP_SETTINGS,
    payload: {api: true, params, path: `/noo/membership/${communityId}`, method: 'POST'},
    meta: {communityId, params, optimistic: true}
  }
}

export function updateCurrentUser (params) {
  return {
    type: UPDATE_CURRENT_USER,
    payload: {api: true, params, path: '/noo/user/me', method: 'POST'},
    meta: {params, optimistic: true}
  }
}

export function saveCurrentCommunityId (dispatch, communityId, isLoggedIn) {
  if (!communityId) return
  const settings = {currentCommunityId: communityId}
  if (isLoggedIn && typeof window !== 'undefined') {
    setTimeout(() => dispatch(updateCurrentUser({settings})), 2000)
  }
  return dispatch(setCurrentCommunityId(communityId))
}

export function fetchCurrentUser (refresh) {
  return {
    type: FETCH_CURRENT_USER,
    payload: {api: true, path: '/noo/user/me'},
    meta: {
      cache: {bucket: 'people', id: 'current', refresh},
      then: resp => (resp.id ? resp : null),
      addDataToStore: {
        people: get('people'),
        communities: get('communities')
      }
    }
  }
}

export function setPassword (email) {
  return {
    type: SET_PASSWORD,
    payload: {api: true, path: '/noo/user/password', params: {email}, method: 'post'}
  }
}
