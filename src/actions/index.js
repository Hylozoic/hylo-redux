export const CANCEL_POST_EDIT = 'CANCEL_POST_EDIT'
export const CANCEL_TYPEAHEAD = 'CANCEL_TYPEAHEAD'
export const CLEAR_CACHE = 'CLEAR_CACHE'
export const CREATE_COMMENT = 'CREATE_COMMENT'
export const CREATE_POST = 'CREATE_POST'
export const FETCH_COMMENTS = 'FETCH_COMMENTS'
export const FETCH_COMMUNITY = 'FETCH_COMMUNITY'
export const FETCH_CURRENT_USER = 'FETCH_CURRENT_USER'
export const FETCH_PEOPLE = 'FETCH_PEOPLE'
export const FETCH_PERSON = 'FETCH_PERSON'
export const FETCH_POST = 'FETCH_POST'
export const FETCH_POSTS = 'FETCH_POSTS'
export const FETCH_PROJECTS = 'FETCH_PROJECTS'
export const LOGIN = 'LOGIN'
export const LOGOUT = 'LOGOUT'
export const NAVIGATE = 'NAVIGATE'
export const REMOVE_DOC = 'REMOVE_DOC'
export const REMOVE_IMAGE = 'REMOVE_IMAGE'
export const SET_LOGIN_ERROR = 'SET_LOGIN_ERROR'
export const START_POST_EDIT = 'START_POST_EDIT'
export const TOGGLE_MAIN_MENU = 'TOGGLE_MAIN_MENU'
export const TYPEAHEAD = 'TYPEAHEAD'
export const UPDATE_POST = 'UPDATE_POST'
export const UPDATE_POST_EDITOR = 'UPDATE_POST_EDITOR'
export const UPLOAD_DOC = 'UPLOAD_DOC'
export const UPLOAD_IMAGE = 'UPLOAD_IMAGE'
export const CHANGE_EVENT_RESPONSE = 'CHANGE_EVENT_RESPONSE'
export const CHANGE_EVENT_RESPONSE_PENDING = 'CHANGE_EVENT_RESPONSE_PENDING'
export const UPDATE_PERSON_SETTINGS = 'UPDATE_PERSON_SETTINGS'
export const UPDATE_PERSON_SETTINGS_EDITOR = 'UPDATE_PERSON_SETTINGS_EDITOR'

import { cleanAndStringify } from '../util/caching'
import { cloneDeep, pick } from 'lodash'

// this is a client-only action
export function login (email, password) {
  return {
    type: LOGIN,
    payload: {api: true, path: '/login', params: {email, password}, method: 'post'}
  }
}

export function setLoginError (message) {
  return {type: SET_LOGIN_ERROR, payload: message}
}

export function logout () {
  return {
    type: LOGOUT,
    payload: {api: true, path: '/logout', method: 'post'}
  }
}

export function fetchPerson (id) {
  return {
    type: FETCH_PERSON,
    payload: {api: true, path: `/noo/user/${id}`},
    meta: {cache: {bucket: 'people', id}}
  }
}

export function fetchCurrentUser () {
  return {
    type: FETCH_CURRENT_USER,
    payload: {api: true, path: '/noo/user/me'},
    meta: {
      cache: {bucket: 'people', id: 'current'},
      then: resp => (resp.id ? resp : null)
    }
  }
}

export function fetchCommunity (id) {
  return {
    type: FETCH_COMMUNITY,
    payload: {api: true, path: `/noo/community/${id}`},
    meta: {cache: {bucket: 'communities', id, requiredProp: 'banner_url'}}
  }
}

export function navigate (path) {
  return {
    type: NAVIGATE,
    payload: path
  }
}

export function fetchComments (postId) {
  // these are ignored since the comment API doesn't do pagination yet
  let limit = 100
  let offset = 0

  return {
    type: FETCH_COMMENTS,
    payload: {api: true, path: `/noo/post/${postId}/comments`},
    meta: {
      id: postId,
      subject: 'post',
      cache: {id: postId, bucket: 'commentsByPost', limit, offset, array: true}
    }
  }
}

export function createComment (postId, text) {
  return {
    type: CREATE_COMMENT,
    payload: {api: true, path: `/noo/post/${postId}/comment`, params: {text}, method: 'POST'},
    meta: {id: postId}
  }
}

export function typeahead (text, id) {
  if (!text) return {type: CANCEL_TYPEAHEAD, meta: {id}}

  return {
    type: TYPEAHEAD,
    payload: {api: true, path: `/noo/autocomplete?${cleanAndStringify({q: text})}`},
    meta: {id}
  }
}

export function updatePostEditor (payload, id) {
  return {
    type: UPDATE_POST_EDITOR,
    payload,
    meta: {id}
  }
}

export function createPost (params) {
  return {
    type: CREATE_POST,
    payload: {api: true, params, path: '/noo/post', method: 'POST'}
  }
}

export function clearCache (bucket, id) {
  return {
    type: CLEAR_CACHE,
    payload: {bucket, id}
  }
}

export function fetchPost (id) {
  return {
    type: FETCH_POST,
    payload: {api: true, path: `/noo/post/${id}`}
  }
}

export function startPostEdit (post) {
  let fields = ['id', 'name', 'type', 'description', 'location', 'communities', 'public', 'media']
  let payload = cloneDeep(pick(post, fields))
  return {type: START_POST_EDIT, payload}
}

export function cancelPostEdit (id) {
  return {type: CANCEL_POST_EDIT, meta: {id}}
}

export function updatePost (id, params) {
  return {
    type: UPDATE_POST,
    payload: {api: true, params, path: `/noo/post/${id}`, method: 'POST'},
    meta: {id, params}
  }
}

export function removeImage (id) {
  return {
    type: REMOVE_IMAGE,
    meta: {id}
  }
}

export function removeDoc (payload, id) {
  return {
    type: REMOVE_DOC,
    payload,
    meta: {id}
  }
}

export function changeEventResponse (id, response, user) {
  return {
    type: CHANGE_EVENT_RESPONSE,
    payload: {api: true, params: {response: response}, path: `/noo/post/${id}/respond`, method: 'POST'},
    meta: {id: id, response: response, user: user}
  }
}

export function toggleMainMenu () {
  return {type: TOGGLE_MAIN_MENU}
}

export function updatePersonSettingsEditor (payload) {
  return {
    type: UPDATE_PERSON_SETTINGS_EDITOR,
    payload
  }
}

export function updatePersonSettings (params) {
  return {
    type: UPDATE_PERSON_SETTINGS,
    payload: {api: true, params, path: `/noo/user/${params.id}`, method: 'POST'},
    meta: {params}
  }
}
