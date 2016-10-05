import { push } from 'react-router-redux'
import { cleanAndStringify } from '../util/caching'
import { get } from 'lodash/fp'

export const _PENDING = '_PENDING'
export const ADD_COMMUNITY_MODERATOR = 'ADD_COMMUNITY_MODERATOR'
export const ADD_COMMUNITY_MODERATOR_PENDING = ADD_COMMUNITY_MODERATOR + _PENDING
export const ADD_DATA_TO_STORE = 'ADD_DATA_TO_STORE'
export const APPEND_COMMENT = 'APPEND_COMMENT'
export const CANCEL_POST_EDIT = 'CANCEL_POST_EDIT'
export const CANCEL_TAG_DESCRIPTION_EDIT = 'CANCEL_TAG_DESCRIPTION_EDIT'
export const CANCEL_TYPEAHEAD = 'CANCEL_TYPEAHEAD'
export const CHANGE_EVENT_RESPONSE = 'CHANGE_EVENT_RESPONSE'
export const CHANGE_EVENT_RESPONSE_PENDING = CHANGE_EVENT_RESPONSE + _PENDING
export const CHECK_FRESHNESS_POSTS = 'CHECK_FRESHNESS_POSTS'
export const CLEAR_CACHE = 'CLEAR_CACHE'
export const CLEAR_INVITATION_EDITOR = 'CLEAR_INVITATION_EDITOR'
export const CLOSE_MODAL = 'CLOSE_MODAL'
export const COMPLETE_POST = 'COMPLETE_POST'
export const COMPLETE_POST_PENDING = COMPLETE_POST + _PENDING
export const CONTINUE_LOGIN = 'CONTINUE_LOGIN'
export const CREATE_COMMENT = 'CREATE_COMMENT'
export const CREATE_COMMUNITY = 'CREATE_COMMUNITY'
export const CREATE_POST = 'CREATE_POST'
export const CREATE_NETWORK = 'CREATE_NETWORK'
export const CREATE_TAG_IN_COMMUNITY = 'CREATE_TAG_IN_COMMUNITY'
export const CREATE_TAG_IN_MODAL = 'CREATE_TAG_IN_MODAL'
export const EDIT_TAG_DESCRIPTION = 'EDIT_TAG_DESCRIPTION'
export const EDIT_NEW_TAG_AND_DESCRIPTION = 'EDIT_NEW_TAG_AND_DESCRIPTION'
export const FETCH_ACTIVITY = 'FETCH_ACTIVITY'
export const FETCH_COMMENTS = 'FETCH_COMMENTS'
export const FETCH_COMMUNITY = 'FETCH_COMMUNITY'
export const FETCH_COMMUNITIES = 'FETCH_COMMUNITIES'
export const FETCH_COMMUNITIES_FOR_NETWORK_NAV = 'FETCH_COMMUNITIES_FOR_NETWORK_NAV'
export const FETCH_COMMUNITY_FOR_INVITATION = 'FETCH_COMMUNITY_FOR_INVITATION'
export const FETCH_COMMUNITY_MODERATORS = 'FETCH_COMMUNITY_MODERATORS'
export const FETCH_COMMUNITY_SETTINGS = 'FETCH_COMMUNITY_SETTINGS'
export const FETCH_CURRENT_USER = 'FETCH_CURRENT_USER'
export const FETCH_FOLLOWED_TAGS = 'FETCH_FOLLOWED_TAGS'
export const FETCH_INVITATIONS = 'FETCH_INVITATIONS'
export const FETCH_LEFT_NAV_TAGS = 'FETCH_LEFT_NAV_TAGS'
export const FETCH_LINK_PREVIEW = 'FETCH_LINK_PREVIEW'
export const FETCH_LIVE_STATUS = 'FETCH_LIVE_STATUS'
export const FETCH_NETWORK = 'FETCH_NETWORK'
export const FETCH_ONBOARDING = 'FETCH_ONBOARDING'
export const FETCH_PEOPLE = 'FETCH_PEOPLE'
export const FETCH_PERSON = 'FETCH_PERSON'
export const FETCH_POST = 'FETCH_POST'
export const FETCH_POSTS = 'FETCH_POSTS'
export const FETCH_RAW_ADMIN_METRICS = 'FETCH_RAW_ADMIN_METRICS'
export const FETCH_TAG = 'FETCH_TAG'
export const FETCH_TAGS = 'FETCH_TAGS'
export const FETCH_TAG_SUMMARY = 'FETCH_TAG_SUMMARY'
export const FETCH_THANKS = 'FETCH_THANKS'
export const FIND_OR_CREATE_THREAD = 'FIND_OR_CREATE_THREAD'
export const FIND_OR_CREATE_THREAD_PENDING = FIND_OR_CREATE_THREAD + _PENDING
export const FINISH_LOGIN = 'FINISH_LOGIN'
export const FOLLOW_POST = 'FOLLOW_POST'
export const FOLLOW_POST_PENDING = FOLLOW_POST + _PENDING
export const FOLLOW_TAG = 'FOLLOW_TAG'
export const FOLLOW_TAG_PENDING = FOLLOW_TAG + _PENDING
export const HIDE_TAG_POPOVER = 'HIDE_TAG_POPOVER'
export const JOIN_COMMUNITY_WITH_CODE = 'JOIN_COMMUNITY_WITH_CODE'
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
export const PIN_POST = 'PIN_POST'
export const PIN_POST_PENDING = 'PIN_POST' + _PENDING
export const REGISTER_TOOLTIP = 'REGISTER_TOOLTIP'
export const REMOVE_COMMENT = 'REMOVE_COMMENT'
export const REMOVE_COMMUNITY_MEMBER = 'REMOVE_COMMUNITY_MEMBER'
export const REMOVE_COMMUNITY_MEMBER_PENDING = 'REMOVE_COMMUNITY_MEMBER' + _PENDING
export const REMOVE_COMMUNITY_MODERATOR = 'REMOVE_COMMUNITY_MODERATOR'
export const REMOVE_COMMUNITY_MODERATOR_PENDING = REMOVE_COMMUNITY_MODERATOR + _PENDING
export const REMOVE_DOC = 'REMOVE_DOC'
export const REMOVE_IMAGE = 'REMOVE_IMAGE'
export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION'
export const REMOVE_POST = 'REMOVE_POST'
export const REMOVE_TAG = 'REMOVE_TAG'
export const RESET_COMMUNITY_VALIDATION = 'RESET_COMMUNITY_VALIDATION'
export const RESET_ERROR = 'RESET_ERROR'
export const RESET_NETWORK_VALIDATION = 'RESET_NETWORK_VALIDATION'
export const SET_STATE = 'SET_STATE'
export const SEARCH = 'SEARCH'
export const SEND_COMMUNITY_INVITATION = 'SEND_COMMUNITY_INVITATION'
export const SEND_COMMUNITY_TAG_INVITATION = 'SEND_COMMUNITY_TAG_INVITATION'
export const SET_CURRENT_COMMUNITY_ID = 'SET_CURRENT_COMMUNITY_ID'
export const SET_CURRENT_NETWORK_ID = 'SET_CURRENT_NETWORK_ID'
export const SET_LOGIN_ERROR = 'SET_LOGIN_ERROR'
export const SET_META_TAGS = 'SET_META_TAGS'
export const SET_MOBILE_DEVICE = 'SET_MOBILE_DEVICE'
export const SET_PASSWORD = 'SET_PASSWORD'
export const SET_SIGNUP_ERROR = 'SET_SIGNUP_ERROR'
export const SHOW_ALL_TAGS = 'SHOW_ALL_TAGS'
export const SHOW_DIRECT_MESSAGE = 'SHOW_DIRECT_MESSAGE'
export const SHOW_EXPANDED_POST = 'SHOW_EXPANDED_POST'
export const SHOW_MODAL = 'SHOW_MODAL'
export const SHOW_SHARE_TAG = 'SHOW_SHARE_TAG'
export const SHOW_TAG_POPOVER = 'SHOW_TAG_POPOVER'
export const SIGNUP = 'SIGNUP'
export const START_POST_EDIT = 'START_POST_EDIT'
export const THANK = 'THANK'
export const THANK_PENDING = THANK + _PENDING
export const TOGGLE_LEFT_NAV = 'TOGGLE_LEFT_NAV'
export const TOGGLE_USER_SETTINGS_SECTION = 'TOGGLE_USER_SETTINGS_SECTION'
export const TYPEAHEAD = 'TYPEAHEAD'
export const UNREGISTER_TOOLTIP = 'UNREGISTER_TOOLTIP'
export const UPDATE_COMMENT = 'UPDATE_COMMENT'
export const UPDATE_COMMENT_PENDING = UPDATE_COMMENT + _PENDING
export const UPDATE_COMMENT_EDITOR = 'UPDATE_COMMENT_EDITOR'
export const UPDATE_COMMUNITY_EDITOR = 'UPDATE_COMMUNITY_EDITOR'
export const UPDATE_INVITATION_EDITOR = 'UPDATE_INVITATION_EDITOR'
export const UPDATE_TAG_INVITATION_EDITOR = 'UPDATE_TAG_INVITATION_EDITOR'
export const UPDATE_COMMUNITY_CHECKLIST = 'UPDATE_COMMUNITY_CHECKLIST'
export const UPDATE_COMMUNITY_SETTINGS = 'UPDATE_COMMUNITY_SETTINGS'
export const UPDATE_COMMUNITY_SETTINGS_PENDING = UPDATE_COMMUNITY_SETTINGS + _PENDING
export const UPDATE_MEMBERSHIP_SETTINGS = 'UPDATE_MEMBERSHIP_SETTINGS'
export const UPDATE_MEMBERSHIP_SETTINGS_PENDING = UPDATE_MEMBERSHIP_SETTINGS + _PENDING
export const UPDATE_MESSAGE_EDITOR = 'UPDATE_MESSAGE_EDITOR'
export const UPDATE_MESSAGE_EDITOR_PENDING = UPDATE_MESSAGE_EDITOR + _PENDING
export const UPDATE_NETWORK = 'UPDATE_NETWORK'
export const UPDATE_NETWORK_PENDING = UPDATE_NETWORK + _PENDING
export const UPDATE_NETWORK_EDITOR = 'UPDATE_NETWORK_EDITOR'
export const UPDATE_POST = 'UPDATE_POST'
export const UPDATE_POST_EDITOR = 'UPDATE_POST_EDITOR'
export const UPDATE_COMMUNITY_TAG = 'UPDATE_COMMUNITY_TAG'
export const UPDATE_COMMUNITY_TAG_PENDING = 'UPDATE_COMMUNITY_TAG_PENDING'
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

export function setPassword (email) {
  return {
    type: SET_PASSWORD,
    payload: {api: true, path: '/noo/user/password', params: {email}, method: 'post'}
  }
}

export function fetchPerson (id) {
  return {
    type: FETCH_PERSON,
    payload: {api: true, path: `/noo/user/${id}`},
    meta: {
      cache: {bucket: 'people', id, requiredProp: 'grouped_post_count'},
      addDataToStore: {
        people: get('people'),
        communities: get('communities')
      }
    }
  }
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

export function navigate (path) {
  return push(path)
}

export function typeahead (text, id, params) {
  if (!text) return {type: CANCEL_TYPEAHEAD, meta: {id}}

  const path = `/noo/autocomplete?${cleanAndStringify({...params, q: text})}`

  return {
    type: TYPEAHEAD,
    payload: {api: true, path: path},
    meta: {id}
  }
}

export function clearCache (bucket, id) {
  return {
    type: CLEAR_CACHE,
    payload: {bucket, id}
  }
}

export function toggleLeftNav () {
  return {type: TOGGLE_LEFT_NAV}
}

export function updateUserSettings (params) {
  return {
    type: UPDATE_USER_SETTINGS,
    payload: {api: true, params, path: '/noo/user/me', method: 'POST'},
    meta: {params, optimistic: true}
  }
}

export function updateMembershipSettings (communityId, params) {
  return {
    type: UPDATE_MEMBERSHIP_SETTINGS,
    payload: {api: true, params, path: `/noo/membership/${communityId}`, method: 'POST'},
    meta: {communityId, params, optimistic: true}
  }
}

export function toggleUserSettingsSection (sectionName, forceOpen) {
  return {
    type: TOGGLE_USER_SETTINGS_SECTION,
    payload: sectionName,
    meta: {forceOpen}
  }
}

export function fetchThanks (id, offset = 0) {
  return {
    type: FETCH_THANKS,
    payload: {api: true, path: `/noo/user/${id}/thanks?offset=${offset}`},
    meta: {id}
  }
}

export function markActivityRead (activityId) {
  return {
    type: MARK_ACTIVITY_READ,
    payload: {api: true, params: {unread: false}, path: `/noo/activity/${activityId}`, method: 'POST'},
    meta: {activityId}
  }
}

// we don't keep track in an activity object which community (or communities) it
// corresponds to, so we instead assume that this action is only dispatched from
// a component which has a list of activities for the community that we want to
// mark as read, and pass in those activities' IDs.
export function markAllActivitiesRead (communityId, activityIds) {
  const path = `/noo/activity/mark-all-read?communityId=${communityId}`
  return {
    type: MARK_ALL_ACTIVITIES_READ,
    payload: {api: true, path, method: 'POST'},
    meta: {communityId, activityIds}
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
    payload: {
      api: true,
      path: `/noo/community/${communityId}/invitations?offset=${offset}`
    },
    meta: {
      communityId,
      reset,
      cache: {
        bucket: 'invitations', id: communityId, array: true, offset, limit: 20
      }
    }
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

export function clearInvitationEditor () {
  return {
    type: CLEAR_INVITATION_EDITOR
  }
}

export function updateTagInvitationEditor (field, value) {
  return {
    type: UPDATE_TAG_INVITATION_EDITOR,
    payload: {field, value}
  }
}

export function sendCommunityTagInvitation (communityId, tagName, params) {
  return {
    type: SEND_COMMUNITY_TAG_INVITATION,
    payload: {api: true, path: `/noo/community/${communityId}/invite/tag/${tagName}`, params, method: 'POST'}
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

export function search (opts) {
  let { limit, offset, type, q, cacheId } = opts
  if (!offset) offset = 0
  let querystring = cleanAndStringify({q, type, limit, offset})
  let cache = {id: cacheId, bucket: 'searchResultsByQuery', limit, offset, array: true}
  return {
    type: SEARCH,
    payload: {api: true, path: `/noo/search/fulltext?${querystring}`},
    meta: {
      cache,
      addDataToStore: {
        communities: get('communities'),
        people: get('people')
      }
    }
  }
}

export function fetchLiveStatus (communityId, slug) {
  const path = `/noo/live-status${communityId ? `?communityId=${communityId}` : ''}`
  return {
    type: FETCH_LIVE_STATUS,
    payload: {api: true, path},
    meta: {slug}
  }
}

export function setCurrentCommunityId (id) {
  return {type: SET_CURRENT_COMMUNITY_ID, payload: id}
}

export function setCurrentNetworkId (id) {
  return {type: SET_CURRENT_NETWORK_ID, payload: id}
}

export function fetchTag (tagName, communityId) {
  const path = communityId
    ? `/noo/community/${communityId}/tag/${tagName}`
    : `/noo/tag/${tagName}`
  return {
    type: FETCH_TAG,
    payload: {api: true, path},
    meta: {id: communityId || 'all', tagName}
  }
}

export function setMobileDevice (enabled = true) {
  return {type: SET_MOBILE_DEVICE, payload: enabled}
}

export function cancelTagDescriptionEdit () {
  return {type: CANCEL_TAG_DESCRIPTION_EDIT}
}

export function editTagDescription (tag, description, is_default) {
  return {type: EDIT_TAG_DESCRIPTION, payload: {tag, description, is_default}}
}

export function editNewTagAndDescription (tag, description, is_default) {
  return {type: EDIT_NEW_TAG_AND_DESCRIPTION, payload: {tag, description, is_default}}
}

export function showTagPopover (tagName, slug, node) {
  return {type: SHOW_TAG_POPOVER, payload: {tagName, slug, node}}
}

export function hideTagPopover () {
  return {type: HIDE_TAG_POPOVER}
}

export function fetchTagSummary (tagName, id) {
  return {
    type: FETCH_TAG_SUMMARY,
    payload: {api: true, path: `/noo/community/${id}/tag/${tagName}/summary`},
    meta: {tagName, id}
  }
}

export function closeModal () {
  return {type: CLOSE_MODAL}
}

export function showExpandedPost (id, commentId) {
  return {type: SHOW_EXPANDED_POST, payload: {id, commentId}}
}

export function showDirectMessage (userId, userName) {
  return {type: SHOW_DIRECT_MESSAGE, payload: {userId, userName}}
}

export function registerTooltip (id, index) {
  return {type: REGISTER_TOOLTIP, payload: {id, index}}
}

export function unregisterTooltip (id) {
  return {type: UNREGISTER_TOOLTIP, payload: {id}}
}

export function addDataToStore (bucket, payload, fromType) {
  return {
    type: ADD_DATA_TO_STORE,
    payload,
    meta: {bucket, fromType}
  }
}

export function showModal (name, payload) {
  return {type: SHOW_MODAL, payload, meta: {name}}
}
