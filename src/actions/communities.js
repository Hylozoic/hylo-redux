import invariant from 'invariant'
import { cleanAndStringify } from '../util/caching'
import {
  ADD_COMMUNITY_MODERATOR,
  CREATE_COMMUNITY,
  FETCH_COMMUNITIES,
  FETCH_COMMUNITIES_FOR_NETWORK_NAV,
  FETCH_COMMUNITY,
  FETCH_COMMUNITY_FOR_INVITATION,
  FETCH_COMMUNITY_MODERATORS,
  FETCH_COMMUNITY_SETTINGS,
  JOIN_COMMUNITY_WITH_CODE,
  LEAVE_COMMUNITY,
  REMOVE_COMMUNITY_MEMBER,
  REMOVE_COMMUNITY_MODERATOR,
  RESET_COMMUNITY_VALIDATION,
  UPDATE_COMMUNITY_EDITOR,
  UPDATE_COMMUNITY_CHECKLIST,
  UPDATE_COMMUNITY_SETTINGS,
  VALIDATE_COMMUNITY_ATTRIBUTE
} from './index'

export function fetchCommunities (opts) {
  let { subject, id, limit, offset, search, cacheId } = opts
  if (!offset) offset = 0
  let payload = {api: true}
  let cache = {id: cacheId, bucket: 'communitiesByQuery', limit, offset, array: true}
  var querystring

  switch (subject) {
    case 'network':
      querystring = cleanAndStringify({search, limit, offset, paginate: true})
      payload.path = `/noo/network/${id}/communities?${querystring}`
      break

  }

  return {type: FETCH_COMMUNITIES, payload, meta: {cache, id}}
}

export function fetchCommunity (id) {
  return {
    type: FETCH_COMMUNITY,
    payload: {api: true, path: `/noo/community/${id}`},
    meta: {cache: {bucket: 'communities', id, requiredProp: 'description'}}
  }
}

export function fetchCommunityForInvitation (token) {
  return {
    type: FETCH_COMMUNITY_FOR_INVITATION,
    payload: {api: true, path: `/noo/invitation/${token}`},
    meta: {token}
  }
}

export function fetchCommunitiesForNetworkNav (networkId) {
  return {
    type: FETCH_COMMUNITIES_FOR_NETWORK_NAV,
    payload: {api: true, path: `/noo/network/${networkId}/communitiesForNav`},
    meta: {networkId}
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

export function updateCommunityChecklist (slug) {
  return {
    type: UPDATE_COMMUNITY_CHECKLIST,
    payload: {api: true, path: `/noo/community/${slug}/update-checklist`, method: 'POST'},
    meta: {slug}
  }
}
