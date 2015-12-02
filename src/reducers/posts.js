import { FETCH_POSTS } from '../actions/fetchPosts'
import { CREATE_POST, FETCH_POST, UPDATE_POST } from '../actions'

const normalize = post => ({
  ...post,
  communities: post.communities.map(c => c.id)
})

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
      let { post } = meta
      return {...state, [post.id]: normalize(post)}
  }

  return state
}
