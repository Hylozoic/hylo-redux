import { hashById } from './util'
import { filter, find } from 'lodash'
import {
  FETCH_ACTIVITY,
  FETCH_COMMENTS,
  CREATE_COMMENT,
  THANK_PENDING
} from '../actions'

export default function (state = {}, action) {
  let { type, error, payload, meta } = action
  if (error) {
    return state
  }

  // the cases where there isn't a payload
  switch (type) {
    case THANK_PENDING:
      let { commentId, userId } = meta
      let userThanks = find(state[commentId].thanks, t => t.thanked_by_id === userId)
      var updatedComment
      if (userThanks) {
        updatedComment = {...state[commentId], thanks: filter(state[commentId].thanks, t => t.thanked_by_id !== userId)}
      } else {
        updatedComment = {...state[commentId], thanks: state[commentId].thanks.concat([{comment_id: commentId, thanked_by_id: userId}])}
      }
      return {...state, [commentId]: updatedComment}
  }

  if (!payload) return state

  switch (type) {
    case FETCH_ACTIVITY:
      let comments = filter(payload.items.map(a => a.comment))
      return {
        ...state,
        ...hashById(comments)
      }
    case FETCH_COMMENTS:
      return {
        ...state,
        ...hashById(payload)
      }
    case CREATE_COMMENT:
      return {
        ...state,
        [payload.id]: payload
      }
  }

  return state
}
