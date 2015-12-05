import { CREATE_POST, FETCH_POST, FETCH_POSTS, UPDATE_POST } from '../actions'
import { omit } from 'lodash'
import { hashById } from './util'

const normalize = post => ({
  ...post,
  communities: post.communities.map(c => c.id)
})

const normalizeUpdate = (post, params) => {
  return {
    ...post,
    ...omit(params, 'imageUrl', 'imageRemoved', 'docs', 'removedDocs')
  }
}

export default function (state = {}, action) {
  let { error, type, payload, meta } = action
  if (error) return state

  switch (type) {
    case FETCH_POSTS:
      return {...state, ...hashById(payload.posts, normalize)}
    case CREATE_POST:
    case FETCH_POST:
      return {...state, [payload.id]: normalize(payload)}
    case UPDATE_POST:
      let { params, id } = meta
      let post = state[id]
      return {...state, [id]: normalizeUpdate(post, params)}
  }

  return state
}
