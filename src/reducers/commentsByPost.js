import { get, filter, map, sortedUniq } from 'lodash/fp'
import { appendUniq } from './util'
import {
  APPEND_COMMENT,
  APPEND_THREAD,
  FETCH_COMMENTS,
  FETCH_POST,
  FETCH_POSTS,
  CREATE_COMMENT,
  CREATE_COMMENT_PENDING
} from '../actions/constants'

export default function (state = {}, action) {
  const { type, error, payload, meta } = action
  if (error) return state

  switch (type) {
    case FETCH_COMMENTS:
      if (meta.subject === 'post') {
        return appendUniq(state, meta.id, map('id', payload.comments))
      }
      break
    case FETCH_POSTS:
      const commentsByPost = payload.posts.reduce((acc, post) => {
        if (post.comments) {
          const existing = state[post.id] || []
          acc[post.id] = sortedUniq(existing.concat(map('id', post.comments)).sort())
        }
        // the post.child is for the sake of project activity cards
        if (post.child && post.child.comments) {
          const existing = state[post.child.id] || []
          acc[post.child.id] = sortedUniq(existing.concat(map('id', post.child.comments)).sort())
        }
        return acc
      }, {})
      return {...state, ...commentsByPost}
    case APPEND_THREAD:
    case FETCH_POST:
      if (!payload.comments) return state
      return {...state, [payload.id]: payload.comments.map(c => c.id)}
    case CREATE_COMMENT_PENDING:
      return appendUniq(state, meta.id, [get('tempComment.id', meta)])
    case CREATE_COMMENT:
      const appended = appendUniq(state, meta.id, [payload.id])
      return {...appended, [meta.id]: filter(x => x !== get('tempComment.id', meta), appended[meta.id])}
    case APPEND_COMMENT:
      return appendUniq(state, meta.id, [payload.id])
  }

  return state
}
