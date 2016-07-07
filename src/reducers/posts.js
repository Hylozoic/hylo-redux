import {
  CHANGE_EVENT_RESPONSE_PENDING,
  CREATE_COMMENT,
  CREATE_POST,
  FETCH_POST,
  FETCH_POSTS,
  FETCH_PERSON,
  FOLLOW_POST,
  PIN_POST_PENDING,
  REMOVE_POST,
  UPDATE_POST,
  VOTE_ON_POST,
  VOTE_ON_POST_PENDING
} from '../actions'
import { compact, omit, find, some, without, includes, map, filter } from 'lodash'
import { get, isNull, omitBy } from 'lodash/fp'
import { cloneSet, mergeList } from './util'
import { same } from '../models'

const normalize = post => omitBy(isNull, {
  ...post,
  children: post.children ? map(post.children, c => c.id) : null,
  communities: map(post.communities, c => c.id),
  numComments: post.num_comments || post.numComments,
  num_comments: null
})

const normalizeUpdate = (post, params, payload) => {
  const normalized = {
    ...post,
    ...omit(params, 'imageUrl', 'imageRemoved', 'docs', 'removedDocs')
  }
  if (some(payload.children)) {
    normalized.children = map(payload.children, c => c.id)
  }
  return normalized
}

const listWithChildren = (post, payload) => {
  if (payload.children) return [post].concat(payload.children.map(normalize))
  return [post]
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

const addOrRemoveFollower = (state, id, person) => {
  let post = state[id]
  let follower = find(post.followers, same('id', person))
  let newFollowers = follower
    ? without(post.followers, follower)
    : (post.followers || []).concat(person)
  return cloneSet(state, `${id}.followers`, newFollowers)
}

const addFollower = (state, id, person) => {
  let post = state[id]
  let follower = find(post.followers, same('id', person))
  return follower
    ? state
    : cloneSet(state, `${id}.followers`, (post.followers || []).concat(person))
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

  let { id } = meta || {}
  let post = state[id]

  switch (type) {
    case FETCH_POSTS:
      return mergeList(state, payload.posts.map(normalize), 'id')
    case CREATE_POST:
    case FETCH_POST:
      return mergeList(state, listWithChildren(normalize(payload), payload), 'id')
    case UPDATE_POST:
      post = normalizeUpdate(post, meta.params, payload)
      return mergeList(state, listWithChildren(post, payload), 'id')
    case CHANGE_EVENT_RESPONSE_PENDING:
      var { response, user } = meta
      return {...state, [id]: changeEventResponse(post, response, user)}
    case VOTE_ON_POST_PENDING:
      let { currentUser } = meta
      let newPost
      let myVote = includes(map(post.voters, 'id'), currentUser.id)

      if (myVote) {
        newPost = {...post, voters: filter(post.voters, v => v.id !== currentUser.id)}
      } else {
        newPost = {...post, voters: post.voters.concat(currentUser)}
      }
      return {...state, [id]: newPost}
    case REMOVE_POST:
      return {...state, [id]: null}
    case FOLLOW_POST:
      return addOrRemoveFollower(state, id, meta.person)
    case CREATE_COMMENT:
      const withFollower = addFollower(state, id, payload.user)
      return {
        ...withFollower,
        [id]: {
          ...withFollower[id],
          numComments: (get('comments.length', post) || 0) + 1
        }
      }
    case FETCH_PERSON:
      const newPosts = compact([payload.recent_request, payload.recent_offer])
      return mergeList(state, newPosts.map(normalize), 'id')
    case PIN_POST_PENDING:
      return {...state, [id]: {...state[id], pinned: !state[id].pinned}}
  }
  return state
}
