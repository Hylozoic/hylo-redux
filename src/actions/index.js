import invariant from 'invariant'
import qs from 'querystring'
import { push } from 'react-router-redux'
import { cleanAndStringify } from '../util/caching'
import { cloneDeep, pick } from 'lodash'

export const _PENDING = '_PENDING'
export const ADD_COMMUNITY_MODERATOR = 'ADD_COMMUNITY_MODERATOR'
export const ADD_COMMUNITY_MODERATOR_PENDING = ADD_COMMUNITY_MODERATOR + _PENDING
export const ADD_DATA_TO_STORE = 'ADD_DATA_TO_STORE'
export const CANCEL_POST_EDIT = 'CANCEL_POST_EDIT'
export const CANCEL_TAG_DESCRIPTION_EDIT = 'CANCEL_TAG_DESCRIPTION_EDIT'
export const CANCEL_TYPEAHEAD = 'CANCEL_TYPEAHEAD'
export const CHANGE_EVENT_RESPONSE = 'CHANGE_EVENT_RESPONSE'
export const CHANGE_EVENT_RESPONSE_PENDING = CHANGE_EVENT_RESPONSE + _PENDING
export const CHECK_FRESHNESS_POSTS = 'CHECK_FRESHNESS_POSTS'
export const CLEAR_CACHE = 'CLEAR_CACHE'
export const CLOSE_MODAL = 'CLOSE_MODAL'
export const CREATE_COMMENT = 'CREATE_COMMENT'
export const CREATE_COMMUNITY = 'CREATE_COMMUNITY'
export const CREATE_POST = 'CREATE_POST'
export const CREATE_NETWORK = 'CREATE_NETWORK'
export const CREATE_TAG_IN_POST_EDITOR = 'CREATE_TAG_IN_POST_EDITOR'
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
export const FETCH_PROJECT_PLEDGE_PROGRESS = 'FETCH_PROJECT_PLEDGE_PROGRESS'
export const CONTRIBUTE_PROJECT = 'CONTRIBUTE_PROJECT'
export const FETCH_POSTS = 'FETCH_POSTS'
export const FETCH_RAW_ADMIN_METRICS = 'FETCH_RAW_ADMIN_METRICS'
export const FETCH_TAG = 'FETCH_TAG'
export const FETCH_TAGS = 'FETCH_TAGS'
export const FETCH_TAG_SUMMARY = 'FETCH_TAG_SUMMARY'
export const FETCH_THANKS = 'FETCH_THANKS'
export const FOLLOW_POST = 'FOLLOW_POST'
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
export const SHOW_EXPANDED_POST = 'SHOW_EXPANDED_POST'
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
export const UPDATE_COMMUNITY_SETTINGS = 'UPDATE_COMMUNITY_SETTINGS'
export const UPDATE_COMMUNITY_SETTINGS_PENDING = UPDATE_COMMUNITY_SETTINGS + _PENDING
export const UPDATE_MEMBERSHIP_SETTINGS = 'UPDATE_MEMBERSHIP_SETTINGS'
export const UPDATE_MEMBERSHIP_SETTINGS_PENDING = UPDATE_MEMBERSHIP_SETTINGS + _PENDING
export const UPDATE_NETWORK = 'UPDATE_NETWORK'
export const UPDATE_NETWORK_PENDING = UPDATE_NETWORK + _PENDING
export const UPDATE_NETWORK_EDITOR = 'UPDATE_NETWORK_EDITOR'
export const UPDATE_POST = 'UPDATE_POST'
export const UPDATE_POST_EDITOR = 'UPDATE_POST_EDITOR'
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
export const DISCONNECT_HITFIN = 'DISCONNECT_HITFIN'
export const SET_HITFIN_ERROR = 'SET_HITFIN_ERROR'
export const USER_BALANCE = 'USER_BALANCE'


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

export function setHitfinError (message) {
  return {type: SET_HITFIN_ERROR, payload: message}
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
      cache: {bucket: 'people', id, requiredProp: 'grouped_post_count'}
    }
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
    meta: {cache: {bucket: 'communities', id, requiredProp: 'settings'}}
  }
}

export function fetchCommunitySettings (id) {
  return {
    type: FETCH_COMMUNITY_SETTINGS,
    payload: {api: true, path: `/noo/community/${id}/settings`},
    meta: {cache: {bucket: 'communities', id, requiredProp: 'beta_access_code'}}
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
  return push(path)
}

export function fetchProjectPledgeProgress(postId){
  return {
    type: FETCH_PROJECT_PLEDGE_PROGRESS,
    payload: {api: true, path: `/noo/post/${postId}/pledge-progress`}
  }
}

export function contributeProject(postId, params){
  return {
    type: CONTRIBUTE_PROJECT,
    payload: {api: true, path: `/noo/post/${postId}/contribute`, params, method: 'POST'}
  }
}

export function fetchComments (postId, opts = {}) {
  // these are ignored since the comment API doesn't do pagination yet
  let limit = opts.limit || 1000
  let offset = opts.offset || 0

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

export function createComment (postId, text, tagDescriptions) {
  const params = {text, tagDescriptions}
  return {
    type: CREATE_COMMENT,
    payload: {api: true, path: `/noo/post/${postId}/comment`, params, method: 'POST'},
    meta: {id: postId}
  }
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

export function updatePostEditor (payload, id) {
  return {
    type: UPDATE_POST_EDITOR,
    payload,
    meta: {id}
  }
}

// id refers to the id of the editing context, e.g. 'new-event'
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
  let querystring = cleanAndStringify({comments: 1, votes: 1, children: 1})

  return {
    type: FETCH_POST,
    payload: {api: true, path: `/noo/post/${id}?${querystring}`},
    meta: {cache: {id, bucket: 'posts', requiredProp: 'children'}}
  }
}

export function startPostEdit (post) {
  let fields = [
    'id', 'name', 'type', 'description', 'location', 'communities', 'public',
    'media', 'start_time', 'end_time', 'tag', 'children', 'linkPreview', 'financialRequestAmount'
  ]
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
    payload: {api: true, params: {response}, path: `/noo/post/${id}/rsvp`, method: 'POST'},
    meta: {id, response, user}
  }
}

export function toggleLeftNav () {
  return {type: TOGGLE_LEFT_NAV}
}

export function updateUserSettings (id, params) {
  return {
    type: UPDATE_USER_SETTINGS,
    payload: {api: true, params, path: `/noo/user/${id}`, method: 'POST'},
    meta: {id, params, optimistic: true}
  }
}

export function leaveCommunity (communityId) {
  return {
    type: LEAVE_COMMUNITY,
    payload: {api: true, path: `/noo/membership/${communityId}`, method: 'DELETE'},
    meta: {communityId, optimistic: true}
  }
}

export function updateCommunitySettings (id, params) {
  invariant(params.slug, 'must include slug in params')
  if (params.leader) params.leader_id = params.leader.id
  return {
    type: UPDATE_COMMUNITY_SETTINGS,
    payload: {api: true, params, path: `/noo/community/${id}`, method: 'POST'},
    meta: {slug: params.slug, params, optimistic: true}
  }
}

export function updateMembershipSettings (communityId, params) {
  return {
    type: UPDATE_MEMBERSHIP_SETTINGS,
    payload: {api: true, params, path: `/noo/membership/${communityId}`, method: 'POST'},
    meta: {communityId, params, optimistic: true}
  }
}

export function addCommunityModerator (community, moderator) {
  return {
    type: ADD_COMMUNITY_MODERATOR,
    payload: {api: true, params: {userId: moderator.id}, path: `/noo/community/${community.id}/moderators`, method: 'POST'},
    meta: {slug: community.slug, moderator, optimistic: true}
  }
}

export function removeCommunityModerator (community, moderatorId) {
  return {
    type: REMOVE_COMMUNITY_MODERATOR,
    payload: {api: true, path: `/noo/community/${community.id}/moderator/${moderatorId}`, method: 'DELETE'},
    meta: {slug: community.slug, moderatorId, optimistic: true}
  }
}

export function removeCommunityMember (community, userId, cacheId) {
  return {
    type: REMOVE_COMMUNITY_MEMBER,
    payload: {api: true, path: `/noo/community/${community.id}/member/${userId}`, method: 'DELETE'},
    meta: {optimistic: true, slug: community.slug, userId, cacheId}
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

export function createCommunity (params) {
  return {
    type: CREATE_COMMUNITY,
    payload: {api: true, params, path: '/noo/community', method: 'POST'}
  }
}

export function joinCommunityWithCode (code, tagName) {
  return {
    type: JOIN_COMMUNITY_WITH_CODE,
    payload: {api: true, params: {code, tagName}, path: '/noo/community/code', method: 'POST'}
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

export function thank (commentId, currentUser) {
  return {
    type: THANK,
    payload: {api: true, params: {unread: false}, path: `/noo/comment/${commentId}/thank`, method: 'POST'},
    meta: {commentId, person: pick(currentUser, 'id', 'name', 'avatar_url')}
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

export function updateTagInvitationEditor (field, value) {
  return {
    type: UPDATE_TAG_INVITATION_EDITOR,
    payload: {field, value}
  }
}

export function sendCommunityTagInvitation (communityId, tagName, params) {
  params.emails = params.emails.join(',')
  return {
    type: SEND_COMMUNITY_TAG_INVITATION,
    payload: {api: true, path: `/noo/community/${communityId}/invite/tag/${tagName}`, params, method: 'POST'}
  }
}

export function voteOnPost (post, currentUser) {
  return {
    type: VOTE_ON_POST,
    payload: {api: true, path: `/noo/post/${post.id}/vote`, method: 'POST'},
    meta: {id: post.id, optimistic: true, currentUser: pick(currentUser, 'id', 'name', 'avatar_url')}
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

export function removePost (id) {
  return {
    type: REMOVE_POST,
    payload: {api: true, path: `/noo/post/${id}`, method: 'DELETE'},
    meta: {id}
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
    meta: {cache}
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

export function followPost (id, person) {
  return {
    type: FOLLOW_POST,
    payload: {api: true, path: `/noo/post/${id}/follow`, method: 'POST'},
    meta: {id, person: pick(person, 'id', 'name', 'avatar_url')}
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

export function removeComment (id) {
  return {
    type: REMOVE_COMMENT,
    payload: {api: true, path: `/noo/comment/${id}`, method: 'DELETE'},
    meta: {id}
  }
}

export function cancelTagDescriptionEdit () {
  return {type: CANCEL_TAG_DESCRIPTION_EDIT}
}

export function editTagDescription (tag, description) {
  return {type: EDIT_TAG_DESCRIPTION, payload: {tag, description}}
}

export function editNewTagAndDescription (tag, description) {
  return {type: EDIT_NEW_TAG_AND_DESCRIPTION, payload: {tag, description}}
}

export function showTagPopover (tagName, slug, position, anchorWidth) {
  return {type: SHOW_TAG_POPOVER, payload: {tagName, slug, position, anchorWidth}}
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

export function createTagInPostEditor () {
  return {
    type: CREATE_TAG_IN_POST_EDITOR
  }
}

export function updateCommentEditor (id, text, newComment) {
  return {
    type: UPDATE_COMMENT_EDITOR,
    payload: {id, text, bucket: newComment ? 'new' : 'edit'}
  }
}

export function pinPost (slug, id) {
  return {
    type: PIN_POST,
    payload: {api: true, path: `/noo/community/${slug}/post/${id}/pin`, method: 'POST'},
    meta: {slug, id}
  }
}

export function fetchLinkPreview (url) {
  const q = qs.stringify({url})
  return {
    type: FETCH_LINK_PREVIEW,
    payload: {api: true, path: `/noo/link-preview?${q}`}
  }
}

export function fetchCommunitiesForNetworkNav (networkId) {
  return {
    type: FETCH_COMMUNITIES_FOR_NETWORK_NAV,
    payload: {api: true, path: `/noo/network/${networkId}/communitiesForNav`},
    meta: {networkId}
  }
}

export function disconnect_hitfin (refresh, dispatch) {
  return {
    type: DISCONNECT_HITFIN,
    payload: {api: true, path: `/noo/unlink/hit-fin`, method: 'DELETE'},
    meta: {
      then: (resp) => {
          dispatch(fetchCurrentUser(true))
      }
    }
  }
}

export function showExpandedPost (id, commentId) {
  return {type: SHOW_EXPANDED_POST, payload: {id, commentId}}
}

export function updateComment (commentId, text, tagDescriptions) {
  const params = {text, tagDescriptions}
  return {
    type: UPDATE_COMMENT,
    payload: {api: true, path: `/noo/comment/${commentId}`, params, method: 'POST'},
    meta: {id: commentId, text, optimistic: true}
  }
}

export function getUserBalance () {
  return {
    type: USER_BALANCE,
    payload: { api:true, path: '/noo/finance/get-balance', method: 'GET'}
    }
  }
  
export function registerTooltip (id, index) {
  return {type: REGISTER_TOOLTIP, payload: {id, index}}
}

export function unregisterTooltip (id) {
  return {type: UNREGISTER_TOOLTIP, payload: {id}}
}

export function addDataToStore (bucket, payload) {
  return {
    type: ADD_DATA_TO_STORE,
    payload,
    meta: {bucket}
  }
}
