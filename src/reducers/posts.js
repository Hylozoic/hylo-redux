import { FETCH_POSTS } from '../actions/fetchPosts'
import { CREATE_POST, FETCH_POST, UPDATE_POST, CHANGE_EVENT_RESPONSE, CHANGE_EVENT_RESPONSE_PENDING } from '../actions'
import { filter, omit, findWhere, without } from 'lodash'

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

const changeEventResponse = (post, response, user) => {
  if (!user) return

  var meInResponders = findWhere(post.responders, {id: user.id})
  var responders = without(post.responders, meInResponders)

  if (!meInResponders || meInResponders.response !== response) {
    responders.push({id: user.id, name: user.name, avatar_url: user.avatar_url, response: response})
  }
  return Object.assign({}, post, { responders: responders })
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
      var { params, context } = meta
      var post = state[context]
      return {...state, [context]: normalizeUpdate(post, params)}
    case CHANGE_EVENT_RESPONSE_PENDING:
      context = meta.context
      post = state[context]
      var { response, user } = meta
      return {...state, [context]: changeEventResponse(post, response, user)}
    case CHANGE_EVENT_RESPONSE:
      return state
  }

  return state
}
