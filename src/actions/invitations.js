import {
  USE_INVITATION,
  FETCH_INVITATIONS,
  APPROVE_JOIN_REQUEST,
  APPROVE_ALL_JOIN_REQUESTS,
  FETCH_JOIN_REQUESTS,
  UPDATE_INVITATION_EDITOR,
  SEND_COMMUNITY_INVITATION,
  RESEND_ALL_COMMUNITY_INVITATIONS,
  CLEAR_INVITATION_EDITOR,
  UPDATE_TAG_INVITATION_EDITOR,
  SEND_COMMUNITY_TAG_INVITATION
} from './constants'

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

export function approveJoinRequest (userId, slug) {
  return {
    type: APPROVE_JOIN_REQUEST,
    payload: {api: true, params: {userId}, path: `/noo/community/${slug}/approve-join-request`, method: 'post'},
    meta: {userId, slug, optimistic: true}
  }
}

export function approveAllJoinRequests (slug) {
  return {
    type: APPROVE_ALL_JOIN_REQUESTS,
    payload: {api: true, path: `/noo/community/${slug}/approve-all-join-requests`, method: 'post'},
    meta: {slug, optimistic: true}
  }
}

export function fetchJoinRequests (communityId, offset = 0, reset) {
  return {
    type: FETCH_JOIN_REQUESTS,
    payload: {
      api: true,
      path: `/noo/community/${communityId}/joinRequests?offset=${offset}`
    },
    meta: {
      communityId,
      reset,
      cache: {
        bucket: 'joinRequests', id: communityId, array: true, offset, limit: 20
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
    payload: {api: true, path: `/noo/community/${communityId}/invite`, params, method: 'POST'},
    meta: {communityId}
  }
}

export function resendAllCommunityInvitations (communityId, params) {
  return {
    type: RESEND_ALL_COMMUNITY_INVITATIONS,
    payload: {api: true, path: `/noo/community/${communityId}/re-invite-all`, params, method: 'POST'},
    meta: {communityId}
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
