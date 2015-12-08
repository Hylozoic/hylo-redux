import { CREATE_POST, FETCH_POST, FETCH_POSTS, UPDATE_POST, CHANGE_EVENT_RESPONSE_PENDING } from '../actions'
import { omit, findWhere, without } from 'lodash'
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

const changeEventResponse = (post, response, user) => {
  if (!user) return

  var meInResponders = findWhere(post.responders, {id: user.id})
  var responders = without(post.responders, meInResponders)

  if (!meInResponders || meInResponders.response !== response) {
    responders.push({id: user.id, name: user.name, avatar_url: user.avatar_url, response: response})
  }
  return {...post, ...{ responders }}
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
    case CHANGE_EVENT_RESPONSE_PENDING:
      id = meta.id
      post = state[id]
      var { response, user } = meta
      return {...state, [id]: changeEventResponse(post, response, user)}
  }
  return state
}
