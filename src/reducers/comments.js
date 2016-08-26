import { hashBy, mergeList, toggleIncludes } from './util'
import { some } from 'lodash'
import {
  ADD_DATA_TO_STORE,
  APPEND_COMMENT,
  FETCH_COMMENTS,
  FETCH_POST,
  FETCH_POSTS,
  CREATE_COMMENT,
  UPDATE_COMMENT_PENDING,
  REMOVE_COMMENT,
  THANK_PENDING
} from '../actions'

export default function (state = {}, action) {
  let { type, error, payload, meta } = action
  if (error) return state

  // the cases where there isn't a payload
  switch (type) {
    case THANK_PENDING:
      let { commentId, person } = meta
      let thanks = toggleIncludes(state[commentId].thanks, person)
      let isThanked = some(thanks, person)
      return {
        ...state,
        [commentId]: {...state[commentId], thanks, isThanked}
      }
    case UPDATE_COMMENT_PENDING:
      return {
        ...state,
        [meta.id]: {...state[meta.id], text: meta.text}
      }
  }

  if (!payload) return state

  let comments
  switch (type) {
    case ADD_DATA_TO_STORE:
      if (meta.bucket === 'comments') return mergeList(state, payload, 'id')
      break
    case APPEND_COMMENT:
      return {...state, [payload.id]: payload}
    case FETCH_COMMENTS:
      return {...state, ...hashBy(payload, 'id')}
    case CREATE_COMMENT:
      return {...state, [payload.id]: payload}
    case FETCH_POSTS:
      comments = payload.posts.reduce((acc, post) => acc.concat(post.comments || []), [])
      return {...state, ...hashBy(comments, 'id')}
    case FETCH_POST:
      return {...state, ...hashBy(payload.comments, 'id')}
    case REMOVE_COMMENT:
      return {...state, [meta.id]: null}
  }

  return state
}
