import {
  CHANGE_EVENT_RESPONSE_PENDING,
  CREATE_POST,
  FETCH_POST,
  FETCH_POSTS,
  REMOVE_POST,
  UPDATE_POST,
  VOTE_ON_POST,
  VOTE_ON_POST_PENDING
} from '../actions'
import { omit, find, without } from 'lodash'
import { mergeList } from './util'

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

  var meInResponders = find(post.responders, {id: user.id})
  var responders = without(post.responders, meInResponders)

  if (!meInResponders || meInResponders.response !== response) {
    responders.push({id: user.id, name: user.name, avatar_url: user.avatar_url, response: response})
  }
  return {...post, ...{ responders }}
}

export default function (state = {}, action) {
  let { error, type, payload, meta } = action
  if (error) {
    switch (type) {
      case VOTE_ON_POST:
        return {
          ...state,
          [meta.id]: {...state[meta.id], ...meta.prevProps}
        }
      default:
        return state
    }
  }

  let id
  switch (type) {
    case FETCH_POSTS:
      return mergeList(state, payload.posts.map(normalize), 'id')
    case CREATE_POST:
    case FETCH_POST:
      return {...state, [payload.id]: normalize(payload)}
    case UPDATE_POST:
      id = meta.id
      let post = state[id]
      return {...state, [id]: normalizeUpdate(post, meta.params)}
    case CHANGE_EVENT_RESPONSE_PENDING:
      id = meta.id
      post = state[id]
      var { response, user } = meta
      return {...state, [id]: changeEventResponse(post, response, user)}
    case VOTE_ON_POST_PENDING:
      id = meta.id
      post = state[id]
      var newPost
      if (post.myVote) {
        newPost = {...post, myVote: false, votes: post.votes - 1}
      } else {
        newPost = {...post, myVote: true, votes: post.votes + 1}
      }
      return {...state, [id]: newPost}
    case REMOVE_POST:
      id = meta.id
      return {...state, [id]: null}
  }
  return state
}
