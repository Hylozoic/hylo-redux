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
export const CREATE_NETWORK = 'CREATE_NETWORK'
export const TOGGLE_USER_SETTINGS_SECTION = 'TOGGLE_USER_SETTINGS_SECTION'
export const FETCH_COMMENTS = 'FETCH_COMMENTS'
export const FETCH_COMMUNITY = 'FETCH_COMMUNITY'
export const FETCH_COMMUNITY_FOR_INVITATION = 'FETCH_COMMUNITY_FOR_INVITATION'
export const FETCH_COMMUNITY_MODERATORS = 'FETCH_COMMUNITY_MODERATORS'
export const FETCH_COMMUNITY_SETTINGS = 'FETCH_COMMUNITY_SETTINGS'
export const FETCH_CURRENT_USER = 'FETCH_CURRENT_USER'
export const FETCH_ACTIVITY = 'FETCH_ACTIVITY'
export const FETCH_INVITATIONS = 'FETCH_INVITATIONS'
export const FETCH_NETWORK = 'FETCH_NETWORK'
export const FETCH_ONBOARDING = 'FETCH_ONBOARDING'
export const FETCH_PEOPLE = 'FETCH_PEOPLE'
export const FETCH_PERSON = 'FETCH_PERSON'
export const FETCH_POST = 'FETCH_POST'
export const FETCH_POSTS = 'FETCH_POSTS'
export const FETCH_PROJECT = 'FETCH_PROJECT'
export const FETCH_PROJECTS = 'FETCH_PROJECTS'
export const JOIN_COMMUNITY_WITH_CODE = 'JOIN_COMMUNITY_WITH_CODE'
export const JOIN_PROJECT = 'JOIN_PROJECT'
export const JOIN_PROJECT_PENDING = JOIN_PROJECT + _PENDING
export const LEAVE_COMMUNITY = 'LEAVE_COMMUNITY'
export const LEAVE_COMMUNITY_PENDING = LEAVE_COMMUNITY + _PENDING
export const LOGIN = 'LOGIN'
export const LOGOUT = 'LOGOUT'
export const MARK_ACTIVITY_READ = 'MARK_ACTIVITY_READ'
export const MARK_ACTIVITY_READ_PENDING = MARK_ACTIVITY_READ + _PENDING
export const MARK_ALL_ACTIVITIES_READ = 'MARK_ALL_ACTIVITIES_READ'
export const MARK_ALL_ACTIVITIES_READ_PENDING = MARK_ALL_ACTIVITIES_READ + _PENDING
export const NAVIGATE = 'NAVIGATE'
export const NOTIFY = 'NOTIFY'
export const REMOVE_COMMUNITY_MODERATOR = 'REMOVE_COMMUNITY_MODERATOR'
export const REMOVE_COMMUNITY_MODERATOR_PENDING = REMOVE_COMMUNITY_MODERATOR + _PENDING
export const REMOVE_DOC = 'REMOVE_DOC'
export const REMOVE_IMAGE = 'REMOVE_IMAGE'
export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION'
export const REMOVE_PROJECT_CONTRIBUTOR = 'REMOVE_PROJECT_CONTRIBUTOR'
export const RESET_COMMUNITY_VALIDATION = 'RESET_COMMUNITY_VALIDATION'
export const RESET_ERROR = 'RESET_ERROR'
export const RESET_NETWORK_VALIDATION = 'RESET_NETWORK_VALIDATION'
export const SEND_COMMUNITY_INVITATION = 'SEND_COMMUNITY_INVITATION'
export const SEND_PROJECT_INVITE = 'SEND_PROJECT_INVITE'
export const SEND_PROJECT_INVITE_PENDING = SEND_PROJECT_INVITE + _PENDING
export const SET_LOGIN_ERROR = 'SET_LOGIN_ERROR'
export const SET_META_TAGS = 'SET_META_TAGS'
export const SET_SIGNUP_ERROR = 'SET_SIGNUP_ERROR'
export const SIGNUP = 'SIGNUP'
export const START_POST_EDIT = 'START_POST_EDIT'
export const START_PROJECT_EDIT = 'START_PROJECT_EDIT'
export const THANK = 'THANK'
export const THANK_PENDING = THANK + _PENDING
export const TOGGLE_PROJECT_MODERATOR_ROLE = 'TOGGLE_PROJECT_MODERATOR_ROLE'
export const TOGGLE_MAIN_MENU = 'TOGGLE_MAIN_MENU'
export const TYPEAHEAD = 'TYPEAHEAD'
export const UPDATE_COMMUNITY_EDITOR = 'UPDATE_COMMUNITY_EDITOR'
export const UPDATE_INVITATION_EDITOR = 'UPDATE_INVITATION_EDITOR'
export const UPDATE_COMMUNITY_SETTINGS = 'UPDATE_COMMUNITY_SETTINGS'
export const UPDATE_COMMUNITY_SETTINGS_PENDING = UPDATE_COMMUNITY_SETTINGS + _PENDING
export const UPDATE_NETWORK_EDITOR = 'UPDATE_NETWORK_EDITOR'
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
export const USE_INVITATION = 'USE_INVITATION'
export const VALIDATE_COMMUNITY_ATTRIBUTE = 'VALIDATE_COMMUNITY_ATTRIBUTE'
export const VALIDATE_COMMUNITY_ATTRIBUTE_PENDING = VALIDATE_COMMUNITY_ATTRIBUTE + _PENDING
export const VALIDATE_NETWORK_ATTRIBUTE = 'VALIDATE_NETWORK_ATTRIBUTE'
export const VALIDATE_NETWORK_ATTRIBUTE_PENDING = VALIDATE_NETWORK_ATTRIBUTE + _PENDING
export const VOTE_ON_POST = 'VOTE_ON_POST'
export const VOTE_ON_POST_PENDING = VOTE_ON_POST + _PENDING

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

export function fetchCurrentUser (refresh) {
  return {
    type: FETCH_CURRENT_USER,
    payload: {api: true, path: '/noo/user/me'},
    meta: {
      cache: {bucket: 'people', id: 'current', refresh},
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

export function joinCommunityWithCode (code) {
  return {
    type: JOIN_COMMUNITY_WITH_CODE,
    payload: {api: true, params: {code}, path: '/noo/community/code', method: 'POST'}
  }
}

export function toggleUserSettingsSection (sectionName, forceOpen) {
  return {
    type: TOGGLE_USER_SETTINGS_SECTION,
    payload: sectionName,
    meta: {forceOpen}
  }
}

export function fetchActivity (offset = 0, resetCount) {
  let limit = 20
  let query = cleanAndStringify({limit, offset, paginate: true, resetCount})
  return {
    type: FETCH_ACTIVITY,
    payload: {api: true, path: `/noo/activity?${query}`, method: 'GET'},
    meta: {
      cache: {bucket: 'activities', limit, offset, array: true},
      resetCount
    }
  }
}

export function markActivityRead (activityId) {
  return {
    type: MARK_ACTIVITY_READ,
    payload: {api: true, params: {unread: false}, path: `/noo/activity/${activityId}`, method: 'POST'},
    meta: {activityId}
  }
}

export function markAllActivitiesRead () {
  return {
    type: MARK_ALL_ACTIVITIES_READ,
    payload: {api: true, path: '/noo/activity/mark-all-read', method: 'POST'}
  }
}

export function thank (commentId, userId) {
  return {
    type: THANK,
    payload: {api: true, params: {unread: false}, path: `/noo/comment/${commentId}/thank`, method: 'POST'},
    meta: {commentId, userId}
  }
}

export function setMetaTags (metaTags) {
  return {
    type: SET_META_TAGS,
    payload: metaTags
  }
}

export function resetError (type) {
  return {
    type: RESET_ERROR,
    meta: {type}
  }
}

export function fetchCommunityForInvitation (token) {
  return {
    type: FETCH_COMMUNITY_FOR_INVITATION,
    payload: {api: true, path: `/noo/invitation/${token}`},
    meta: {token}
  }
}

export function useInvitation (token) {
  return {
    type: USE_INVITATION,
    payload: {api: true, path: `/noo/invitation/${token}`, method: 'POST'},
    meta: {token}
  }
}

export function fetchInvitations (communityId, offset = 0, reset) {
  return {
    type: FETCH_INVITATIONS,
    payload: {api: true, path: `/noo/community/${communityId}/invitations?offset=${offset}`},
    meta: {communityId, reset}
  }
}

export function updateInvitationEditor (field, value) {
  return {
    type: UPDATE_INVITATION_EDITOR,
    payload: {field, value}
  }
}

export function sendCommunityInvitation (communityId, params) {
  params.emails = params.emails.join(',')
  return {
    type: SEND_COMMUNITY_INVITATION,
    payload: {api: true, path: `/noo/community/${communityId}/invite`, params, method: 'POST'}
  }
}

export function voteOnPost (post) {
  return {
    type: VOTE_ON_POST,
    payload: {api: true, path: `/noo/post/${post.id}/vote`, method: 'POST'},
    meta: {id: post.id, prevProps: post}
  }
}

export function notify (text, opts) {
  return {
    type: NOTIFY,
    payload: {
      id: Date.now(),
      text,
      type: 'info',
      maxage: 5000,
      ...opts
    }
  }
}

export function removeNotification (id) {
  return {
    type: REMOVE_NOTIFICATION,
    payload: id
  }
}

export function createNetwork (params) {
  return {
    type: CREATE_NETWORK,
    payload: {api: true, params, path: '/noo/network', method: 'POST'}
  }
}

export function validateNetworkAttribute (key, value, constraint) {
  return {
    type: VALIDATE_NETWORK_ATTRIBUTE,
    payload: {api: true, params: {column: key, value, constraint}, path: '/noo/network/validate', method: 'POST'},
    meta: {key}
  }
}

export function resetNetworkValidation (key) {
  return {
    type: RESET_NETWORK_VALIDATION,
    meta: {key}
  }
}

export function updateNetworkEditor (subtree, changes) {
  return {
    type: UPDATE_NETWORK_EDITOR,
    payload: changes,
    meta: {subtree}
  }
}

export function fetchOnboarding (userId, communityId) {
  let path = `/noo/user/${userId}/onboarding?communityId=${communityId}`
  return {
    type: FETCH_ONBOARDING,
    payload: {api: true, path}
  }
}

export function fetchNetwork (id) {
  return {
    type: FETCH_NETWORK,
    payload: {api: true, path: `/noo/network/${id}`},
    meta: {cache: {bucket: 'networks', id, requiredProp: 'banner_url'}}
  }
}
