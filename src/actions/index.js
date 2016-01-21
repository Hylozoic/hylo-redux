const _PENDING = '_PENDING'
export const ADD_COMMUNITY_MODERATOR = 'ADD_COMMUNITY_MODERATOR'
export const ADD_COMMUNITY_MODERATOR_PENDING = ADD_COMMUNITY_MODERATOR + _PENDING
export const CANCEL_POST_EDIT = 'CANCEL_POST_EDIT'
export const CANCEL_TYPEAHEAD = 'CANCEL_TYPEAHEAD'
export const CHANGE_EVENT_RESPONSE = 'CHANGE_EVENT_RESPONSE'
export const CHANGE_EVENT_RESPONSE_PENDING = CHANGE_EVENT_RESPONSE + _PENDING
export const CLEAR_CACHE = 'CLEAR_CACHE'
export const CREATE_COMMENT = 'CREATE_COMMENT'
export const CREATE_COMMUNITY = 'CREATE_COMMUNITY'
export const CREATE_POST = 'CREATE_POST'
export const CREATE_PROJECT = 'CREATE_PROJECT'
export const TOGGLE_USER_SETTINGS_SECTION = 'TOGGLE_USER_SETTINGS_SECTION'
export const FETCH_COMMENTS = 'FETCH_COMMENTS'
export const FETCH_COMMUNITY = 'FETCH_COMMUNITY'
export const FETCH_COMMUNITY_MODERATORS = 'FETCH_COMMUNITY_MODERATORS'
export const FETCH_COMMUNITY_SETTINGS = 'FETCH_COMMUNITY_SETTINGS'
export const FETCH_CURRENT_USER = 'FETCH_CURRENT_USER'
export const FETCH_PEOPLE = 'FETCH_PEOPLE'
export const FETCH_PERSON = 'FETCH_PERSON'
export const FETCH_POST = 'FETCH_POST'
export const FETCH_POSTS = 'FETCH_POSTS'
export const FETCH_PROJECT = 'FETCH_PROJECT'
export const FETCH_PROJECTS = 'FETCH_PROJECTS'
export const JOIN_PROJECT = 'JOIN_PROJECT'
export const JOIN_PROJECT_PENDING = JOIN_PROJECT + _PENDING
export const LEAVE_COMMUNITY = 'LEAVE_COMMUNITY'
export const LEAVE_COMMUNITY_PENDING = LEAVE_COMMUNITY + _PENDING
export const LOGIN = 'LOGIN'
export const LOGOUT = 'LOGOUT'
export const NAVIGATE = 'NAVIGATE'
export const REMOVE_COMMUNITY_MODERATOR = 'REMOVE_COMMUNITY_MODERATOR'
export const REMOVE_COMMUNITY_MODERATOR_PENDING = REMOVE_COMMUNITY_MODERATOR + _PENDING
export const REMOVE_DOC = 'REMOVE_DOC'
export const REMOVE_IMAGE = 'REMOVE_IMAGE'
export const REMOVE_PROJECT_CONTRIBUTOR = 'REMOVE_PROJECT_CONTRIBUTOR'
export const RESET_COMMUNITY_VALIDATION = 'RESET_COMMUNITY_VALIDATION'
export const SET_LOGIN_ERROR = 'SET_LOGIN_ERROR'
export const SET_SIGNUP_ERROR = 'SET_SIGNUP_ERROR'
export const SEND_PROJECT_INVITE = 'SEND_PROJECT_INVITE'
export const SEND_PROJECT_INVITE_PENDING = SEND_PROJECT_INVITE + _PENDING
export const SIGNUP = 'SIGNUP'
export const START_POST_EDIT = 'START_POST_EDIT'
export const START_PROJECT_EDIT = 'START_PROJECT_EDIT'
export const TOGGLE_PROJECT_MODERATOR_ROLE = 'TOGGLE_PROJECT_MODERATOR_ROLE'
export const TOGGLE_MAIN_MENU = 'TOGGLE_MAIN_MENU'
export const TYPEAHEAD = 'TYPEAHEAD'
export const UPDATE_COMMUNITY_EDITOR = 'UPDATE_COMMUNITY_EDITOR'
export const UPDATE_COMMUNITY_SETTINGS = 'UPDATE_COMMUNITY_SETTINGS'
export const UPDATE_COMMUNITY_SETTINGS_PENDING = UPDATE_COMMUNITY_SETTINGS + _PENDING
export const UPDATE_POST = 'UPDATE_POST'
export const UPDATE_POST_EDITOR = 'UPDATE_POST_EDITOR'
export const UPDATE_PROJECT = 'UPDATE_PROJECT'
export const UPDATE_PROJECT_EDITOR = 'UPDATE_PROJECT_EDITOR'
export const UPDATE_PROJECT_INVITE = 'UPDATE_PROJECT_INVITE'
export const UPDATE_USER_SETTINGS = 'UPDATE_USER_SETTINGS'
export const UPDATE_USER_SETTINGS_PENDING = UPDATE_USER_SETTINGS + _PENDING
export const UPLOAD_DOC = 'UPLOAD_DOC'
export const UPLOAD_IMAGE = 'UPLOAD_IMAGE'
export const UPLOAD_IMAGE_PENDING = UPLOAD_IMAGE + _PENDING
export const VALIDATE_COMMUNITY_ATTRIBUTE = 'VALIDATE_COMMUNITY_ATTRIBUTE'
export const VALIDATE_COMMUNITY_ATTRIBUTE_PENDING = VALIDATE_COMMUNITY_ATTRIBUTE + _PENDING

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

export function signup (name, email, password) {
  let params = {name, email, password, resp: 'user', login: true}
  return {
    type: SIGNUP,
    payload: {api: true, path: '/noo/user', params, method: 'post'}
  }
}

export function setSignupError (message) {
  return {type: SET_SIGNUP_ERROR, payload: message}
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

export function fetchCommunitySettings (id) {
  return {
    type: FETCH_COMMUNITY_SETTINGS,
    payload: {api: true, path: `/noo/community/${id}/settings`},
    meta: {cache: {bucket: 'communities', id, requiredProp: 'welcome_message'}}
  }
}

export function fetchCommunityModerators (id) {
  return {
    type: FETCH_COMMUNITY_MODERATORS,
    payload: {api: true, path: `/noo/community/${id}/moderators`},
    meta: {cache: {bucket: 'communities', id, requiredProp: 'moderators'}}
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

export function typeahead (text, id, params) {
  if (!text) return {type: CANCEL_TYPEAHEAD, meta: {id}}

  let path = `/noo/autocomplete?${cleanAndStringify({...params, q: text})}`

  return {
    type: TYPEAHEAD,
    payload: {api: true, path: path},
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

// id refers to the id of the editing context, e.g. 'project-5-new'
export function createPost (id, params) {
  return {
    type: CREATE_POST,
    payload: {api: true, params, path: '/noo/post', method: 'POST'},
    meta: {id}
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
    payload: {api: true, path: `/noo/post/${id}`},
    meta: {cache: {id, bucket: 'posts'}}
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

export function removeImage (subject, id) {
  return {
    type: REMOVE_IMAGE,
    meta: {subject, id}
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

export function updateUserSettings (params, prevProps) {
  return {
    type: UPDATE_USER_SETTINGS,
    payload: {api: true, params, path: `/noo/user/${params.id}`, method: 'POST'},
    meta: {params, prevProps}
  }
}

export function leaveCommunity (communityId, prevProps) {
  return {
    type: LEAVE_COMMUNITY,
    payload: {api: true, path: `/noo/membership/${communityId}`, method: 'DELETE'},
    meta: {communityId, prevProps}
  }
}

export function updateCommunitySettings (params, prevProps) {
  if (params.leader) params.leader_id = params.leader.id
  return {
    type: UPDATE_COMMUNITY_SETTINGS,
    payload: {api: true, params, path: `/noo/community/${params.id}`, method: 'POST'},
    meta: {slug: params.slug, params, prevProps}
  }
}

export function addCommunityModerator (community, moderator, prevProps) {
  return {
    type: ADD_COMMUNITY_MODERATOR,
    payload: {api: true, params: {userId: moderator.id}, path: `/noo/community/${community.id}/moderators`, method: 'POST'},
    meta: {slug: community.slug, moderator, prevProps}
  }
}

export function removeCommunityModerator (community, moderatorId, prevProps) {
  return {
    type: REMOVE_COMMUNITY_MODERATOR,
    payload: {api: true, path: `/noo/community/${community.id}/moderator/${moderatorId}`, method: 'DELETE'},
    meta: {slug: community.slug, moderatorId, prevProps}
  }
}

export function validateCommunityAttribute (key, value, constraint) {
  return {
    type: VALIDATE_COMMUNITY_ATTRIBUTE,
    payload: {api: true, params: {column: key, value, constraint}, path: '/noo/community/validate', method: 'POST'},
    meta: {key}
  }
}

export function resetCommunityValidation (key) {
  return {
    type: RESET_COMMUNITY_VALIDATION,
    meta: {key}
  }
}

export function updateCommunityEditor (subtree, changes) {
  return {
    type: UPDATE_COMMUNITY_EDITOR,
    payload: changes,
    meta: {subtree}
  }
}

export function updateProjectInvite (payload, id) {
  return {
    type: UPDATE_PROJECT_INVITE,
    payload,
    meta: {id}
  }
}

export function sendProjectInvite (params, id) {
  return {
    type: SEND_PROJECT_INVITE,
    payload: {api: true, params, path: `/noo/project/${id}/invite`, method: 'POST'},
    meta: {id}
  }
}

export function createCommunity (params) {
  return {
    type: CREATE_COMMUNITY,
    payload: {api: true, params, path: '/noo/community', method: 'POST'}
  }
}

export function toggleUserSettingsSection (sectionName) {
  return {
    type: TOGGLE_USER_SETTINGS_SECTION,
    payload: sectionName
  }
}
