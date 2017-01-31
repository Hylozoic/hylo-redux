import {
  APPEND_COMMENT,
  CREATE_COMMENT,
  FETCH_COMMENTS,
  REMOVE_COMMENT,
  THANK,
  UPDATE_COMMENT,
  UPDATE_COMMENT_EDITOR
} from './constants'
import { get } from 'lodash/fp'
import { cleanAndStringify } from '../util/caching'

export function fetchComments (postId, opts = {}) {
  let { limit, refresh, beforeId, afterId, newest } = opts
  if (!limit) limit = 1000

  let querystring = cleanAndStringify({beforeId, afterId, newest, limit})

  return {
    type: FETCH_COMMENTS,
    payload: {api: true, path: `/noo/post/${postId}/comments?${querystring}`},
    meta: {
      id: postId,
      subject: 'post',
      cache: {id: postId, bucket: 'commentsByPost', limit, refresh, array: true},
      addDataToStore: {
        people: get('people')
      }
    }
  }
}

export function appendComment (postId, comment) {
  return {
    type: APPEND_COMMENT,
    payload: comment,
    meta: {
      id: postId,
      addDataToStore: {
        people: get('people')
      }
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

export function updateComment (commentId, text, tagDescriptions) {
  const params = {text, tagDescriptions}
  return {
    type: UPDATE_COMMENT,
    payload: {api: true, path: `/noo/comment/${commentId}`, params, method: 'POST'},
    meta: {id: commentId, text, optimistic: true}
  }
}

export function updateCommentEditor (id, text, newComment) {
  return {
    type: UPDATE_COMMENT_EDITOR,
    payload: {id, text, bucket: newComment ? 'new' : 'edit'}
  }
}

export function removeComment (id, postId) {
  return {
    type: REMOVE_COMMENT,
    payload: {api: true, path: `/noo/comment/${id}`, method: 'DELETE'},
    meta: {id, postId}
  }
}

export function thank (id, currentUser) {
  return {
    type: THANK,
    payload: {api: true, params: {unread: false}, path: `/noo/comment/${id}/thank`, method: 'POST'},
    meta: {id, personId: currentUser.id}
  }
}
