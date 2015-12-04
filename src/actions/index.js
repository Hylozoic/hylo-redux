import { cleanAndStringify } from '../util/caching'
import { cloneDeep, omit, pick } from 'lodash'

export const LOGIN = 'LOGIN'

// this is a client-only action
export function login (email, password) {
  return {
    type: LOGIN,
    payload: {api: true, path: '/login', params: {email, password}, method: 'post'}
  }
}

export const SET_LOGIN_ERROR = 'SET_LOGIN_ERROR'

export function setLoginError (message) {
  return {type: SET_LOGIN_ERROR, payload: message}
}

export const LOGOUT = 'LOGOUT'

export function logout () {
  return {
    type: LOGOUT,
    payload: {api: true, path: '/logout', method: 'post'}
  }
}

export const FETCH_PERSON = 'FETCH_PERSON'

export function fetchPerson (id) {
  return {
    type: FETCH_PERSON,
    payload: {api: true, path: `/noo/user/${id}`},
    meta: {cache: {bucket: 'people', id}}
  }
}

export const FETCH_CURRENT_USER = 'FETCH_CURRENT_USER'

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

export const FETCH_COMMUNITY = 'FETCH_COMMUNITY'

export function fetchCommunity (id) {
  return {
    type: FETCH_COMMUNITY,
    payload: {api: true, path: `/noo/community/${id}`},
    meta: {cache: {bucket: 'communities', id, requiredProp: 'banner_url'}}
  }
}

export const NAVIGATE = 'NAVIGATE'

export function navigate (path) {
  return {
    type: NAVIGATE,
    payload: path
  }
}

export const FETCH_COMMENTS = 'FETCH_COMMENTS'

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

export const CREATE_COMMENT = 'CREATE_COMMENT'

export function createComment (postId, text) {
  return {
    type: CREATE_COMMENT,
    payload: {api: true, path: `/noo/post/${postId}/comment`, params: {text}, method: 'POST'},
    meta: {id: postId}
  }
}

export const TYPEAHEAD = 'TYPEAHEAD'
export const CANCEL_TYPEAHEAD = 'CANCEL_TYPEAHEAD'

export function typeahead (opts) {
  let { cancel, context } = opts
  if (cancel) return {type: CANCEL_TYPEAHEAD, meta: {context}}

  let querystring = cleanAndStringify({...omit(opts, 'text'), q: opts.text})

  return {
    type: TYPEAHEAD,
    payload: {api: true, path: `/noo/autocomplete?${querystring}`},
    meta: {context}
  }
}

export const UPDATE_POST_EDITOR = 'UPDATE_POST_EDITOR'

export function updatePostEditor (payload, context) {
  return {
    type: UPDATE_POST_EDITOR,
    payload,
    meta: {context}
  }
}

export const CREATE_POST = 'CREATE_POST'

export function createPost (params, context) {
  return {
    type: CREATE_POST,
    payload: {api: true, params, path: '/noo/post', method: 'POST'},
    meta: {context}
  }
}

export const CLEAR_CACHE = 'CLEAR_CACHE'

export function clearCache (bucket, id) {
  return {
    type: CLEAR_CACHE,
    payload: {bucket, id}
  }
}

export const FETCH_POST = 'FETCH_POST'

export function fetchPost (id) {
  return {
    type: FETCH_POST,
    payload: {api: true, path: `/noo/post/${id}`}
  }
}

export const START_POST_EDIT = 'START_POST_EDIT'

export function startPostEdit (post) {
  let fields = ['id', 'name', 'description', 'location', 'communities', 'public', 'media']
  let payload = cloneDeep(pick(post, fields))
  return {type: START_POST_EDIT, payload}
}

export const CANCEL_POST_EDIT = 'CANCEL_POST_EDIT'

export function cancelPostEdit (id) {
  return {type: CANCEL_POST_EDIT, meta: {context: id}}
}

export const UPDATE_POST = 'UPDATE_POST'

export function updatePost (id, params) {
  return {
    type: UPDATE_POST,
    payload: {api: true, params, path: `/noo/post/${id}`, method: 'POST'},
    meta: {context: id, params}
  }
}

export const REMOVE_IMAGE = 'REMOVE_IMAGE'

export function removeImage (context) {
  return {
    type: REMOVE_IMAGE,
    meta: {context}
  }
}
