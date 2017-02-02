import { addOrRemovePersonId, hashBy, mergeList } from './util'
import { omit } from 'lodash/fp'
import {
  ADD_DATA_TO_STORE,
  APPEND_COMMENT,
  APPEND_THREAD,
  FETCH_COMMENTS,
  FETCH_POST,
  FETCH_POSTS,
  CREATE_COMMENT,
  UPDATE_COMMENT_PENDING,
  REMOVE_COMMENT,
  THANK_PENDING,
  UPLOAD_IMAGE
} from '../actions/constants'

export default function (state = {}, action) {
  let { type, error, payload, meta } = action
  if (error) return state

  // the cases where there isn't a payload
  switch (type) {
    case THANK_PENDING:
      let { id, personId } = meta
      return addOrRemovePersonId(state, id, personId, 'thank_ids')
    case UPDATE_COMMENT_PENDING:
      return {
        ...state,
        [meta.id]: {...state[meta.id], text: meta.text}
      }
  }

  if (!payload) return state

  let comments
  switch (type) {
    case ADD_DATA_TO_STORE:
      if (meta.bucket === 'comments') return mergeList(state, payload, 'id')
      break
    case APPEND_COMMENT:
    case CREATE_COMMENT:
      return {...state, [payload.id]: omit('people', payload)}
    case FETCH_POSTS:
      comments = payload.posts.reduce((acc, post) => {
        // the post.child is for the sake of project activity cards
        return acc.concat(post.comments || []).concat(post.child ? post.child.comments : [])
      },[])
      return {...state, ...hashBy(comments, 'id')}
    case APPEND_THREAD:
    case FETCH_COMMENTS:
    case FETCH_POST:
      return {...state, ...hashBy(payload.comments, 'id')}
    case REMOVE_COMMENT:
      return {...state, [meta.id]: null}
    case UPLOAD_IMAGE:
      if (meta.subject !== 'comment-image') break
      return {
        ...state,
        community: {...state.community, avatar_url: payload}
      }
  }

  return state
}
