import { map, sortedUniq } from 'lodash/fp'
import { appendUniq } from './util'
import {
  APPEND_COMMENT,
  APPEND_THREAD,
  FETCH_COMMENTS,
  FETCH_POST,
  FETCH_POSTS,
  CREATE_COMMENT
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
        return acc
      }, {})
      return {...state, ...commentsByPost}
    case APPEND_THREAD:
    case FETCH_POST:
      if (!payload.comments) return state
      return {...state, [payload.id]: payload.comments.map(c => c.id)}
    case CREATE_COMMENT:
    case APPEND_COMMENT:
      return appendUniq(state, meta.id, [payload.id])
  }

  return state
}
