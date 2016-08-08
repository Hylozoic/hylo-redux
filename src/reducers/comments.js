import { hashBy, mergeList, toggleIncludes } from './util'
import { filter, some } from 'lodash'
import {
  FETCH_ACTIVITY,
  FETCH_COMMENTS,
  FETCH_POST,
  FETCH_POSTS,
  CREATE_COMMENT,
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
  }

  if (!payload) return state

  switch (type) {
    case FETCH_ACTIVITY:
      let comments = filter(payload.items.map(a => a.comment))
      return mergeList(state, comments, 'id')
    case FETCH_COMMENTS:
      return {
        ...state,
        ...hashBy(payload, 'id')
      }
    case CREATE_COMMENT:
      return {
        ...state,
        [payload.id]: payload
      }
    case FETCH_POSTS:
      comments = payload.posts.reduce((acc, post) => acc.concat(post.comments || []), [])
      return {
        ...state,
        ...hashBy(comments, 'id')
      }
    case FETCH_POST:
      return {
        ...state,
        ...hashBy(payload.comments, 'id')
      }
    case REMOVE_COMMENT:
      return {
        ...state,
        [meta.id]: null
      }
  }

  return state
}
