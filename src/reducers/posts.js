import { FETCH_POSTS } from '../actions/fetchPosts'
import { CREATE_POST, FETCH_POST, UPDATE_POST } from '../actions'
import { filter, omit } from 'lodash'

const normalize = post => ({
  ...post,
  communities: post.communities.map(c => c.id)
})

const normalizeUpdate = (post, params) => {
  let { imageUrl, imageRemoved } = params
  let media = post.media || []

  if (imageRemoved) {
    return {
      ...post,
      ...omit(params, 'imageRemoved', 'imageUrl'),
      media: filter(media, m => m.type !== 'image')
    }
  } else if (imageUrl) {
    let image = {type: 'image', url: imageUrl}
    return {
      ...post,
      ...omit(params, 'imageUrl'),
      media: media.filter(m => m.type !== 'image').concat(image)
    }
  }

  return {...post, ...params}
}

export default function (state = {}, action) {
  let { error, type, payload, meta } = action
  if (error) return state

  switch (type) {
    case FETCH_POSTS:
      let posts = payload.posts.reduce((m, p) => {
        m[p.id] = normalize(p)
        return m
      }, {})
      return {...state, ...posts}
    case CREATE_POST:
    case FETCH_POST:
      return {...state, [payload.id]: normalize(payload)}
    case UPDATE_POST:
      let { params, context } = meta
      let post = state[context]
      return {...state, [context]: normalizeUpdate(post, params)}
  }

  return state
}
