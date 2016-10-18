import {
  CHANGE_EVENT_RESPONSE_PENDING,
  COMPLETE_POST_PENDING,
  APPEND_COMMENT,
  APPEND_THREAD,
  CREATE_COMMENT,
  CREATE_POST,
  FETCH_POST,
  FETCH_POSTS,
  FETCH_PERSON,
  FIND_OR_CREATE_THREAD,
  FOLLOW_POST_PENDING,
  PIN_POST_PENDING,
  REMOVE_COMMENT,
  REMOVE_POST,
  UNFOLLOW_POST_PENDING,
  UPDATE_POST,
  UPDATE_POST_READ_TIME,
  VOTE_ON_POST_PENDING
} from '../actions'
import { compact, omit, find, some, without, map, uniq } from 'lodash'
import { get, isNull, isUndefined, omitBy } from 'lodash/fp'
import { addOrRemovePersonId, mergeList } from './util'

const normalize = (post) => omitBy(x => isNull(x) || isUndefined(x), {
  ...post,
  children: post.children ? map(post.children, c => c.id) : null, // FIXME should be child_ids
  numComments: post.num_comments || post.numComments,
  num_comments: null,
  comments: null,
  communities: null,
  people: null
})

const normalizeUpdate = (post, params, payload) => {
  const normalized = {
    ...omit(post, 'linkPreview'),
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

const updatePostProps = (state, postId, props) => {
  return {
    ...state,
    [postId]: {...state[postId], ...props}
  }
}

export default function (state = {}, action) {
  const { error, type, payload, meta } = action
  if (error) return state

  let { id, personId, postId } = meta || {}
  let post = state[id]

  switch (type) {
    case FETCH_POSTS:
      return mergeList(state, payload.posts.map(normalize), 'id')
    case APPEND_THREAD:
    case CREATE_POST:
    case FETCH_POST:
    case FIND_OR_CREATE_THREAD:
      return mergeList(state, listWithChildren(normalize(payload), payload), 'id')
    case UPDATE_POST:
      post = normalizeUpdate(post, meta.params, payload)
      return mergeList(state, listWithChildren(post, payload), 'id', {drop: ['linkPreview']})
    case CHANGE_EVENT_RESPONSE_PENDING:
      var { response, user } = meta
      return {...state, [id]: changeEventResponse(post, response, user)}
    case VOTE_ON_POST_PENDING:
      return addOrRemovePersonId(state, id, personId, 'voter_ids')
    case REMOVE_POST:
      return {...state, [id]: null}
    case FOLLOW_POST_PENDING:
      return addOrRemovePersonId(state, id, personId, 'follower_ids')
    case UNFOLLOW_POST_PENDING:
      post = state[id]
      return {
        ...state,
        [id]: {...post, follower_ids: without(post.follower_ids, personId)}
      }
    case APPEND_COMMENT:
      if (!post) return state 
      return updatePostProps(state, id, {
        numComments: (post.numComments || 0) + 1,
        updated_at: new Date().toISOString()
      })
    case CREATE_COMMENT:
      return updatePostProps(state, id, {
        follower_ids: uniq((post.follower_ids || []).concat(payload.user_id)),
        numComments: (post.numComments || 0) + 1,
        updated_at: new Date().toISOString(),
        last_read_at: new Date().toISOString()
      })
    case REMOVE_COMMENT:
      return updatePostProps(state, postId, {
        numComments: state[meta.postId].numComments - 1
      })
    case FETCH_PERSON:
      const newPosts = compact([payload.recent_request, payload.recent_offer])
      return mergeList(state, newPosts.map(normalize), 'id')
    case PIN_POST_PENDING:
      post = state[id]
      const membership = get(['memberships', meta.slug], post)
      return {
        ...state,
        [id]: {
          ...post,
          memberships: {
            ...post.memberships,
            [meta.slug]: {...membership, pinned: !get('pinned', membership)}
          }
        }
      }
    case COMPLETE_POST_PENDING:
      return updatePostProps(state, id, {
        fulfilled_at: post.fulfilled_at ? null : new Date().toISOString()
      })
    case UPDATE_POST_READ_TIME:
      return updatePostProps(state, id, {last_read_at: new Date().toISOString()})
  }
  return state
}
