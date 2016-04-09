import { uniq } from 'lodash'
import {
  FETCH_COMMENTS,
  FETCH_POST,
  FETCH_POSTS,
  CREATE_COMMENT
} from '../actions'

export default function (state = {}, action) {
  let { type, error, payload, meta } = action
  if (error) {
    return state
  }

  switch (type) {
    case FETCH_COMMENTS:
      if (meta.subject === 'post') {
        let existing = state[meta.id] || []
        return {
          ...state,
          [meta.id]: uniq(existing.concat(payload.map(c => c.id)))
        }
      }
      break
    case FETCH_POSTS:
      let commentsByPost = payload.posts.reduce((acc, post) => {
        if (post.comments) acc[post.id] = post.comments.map(c => c.id)
        return acc
      }, {})
      return {...state, ...commentsByPost}
    case FETCH_POST:
      if (!payload.comments) return state
      return {...state, [payload.id]: payload.comments.map(c => c.id)}
    case CREATE_COMMENT:
      let existing = state[meta.id] || []
      return {
        ...state,
        [meta.id]: uniq(existing.concat([payload.id]))
      }
  }

  return state
}
