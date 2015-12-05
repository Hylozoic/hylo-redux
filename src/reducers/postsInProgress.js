import { uniq } from 'lodash'

import {
  CANCEL_POST_EDIT,
  CREATE_POST,
  REMOVE_DOC,
  REMOVE_IMAGE,
  START_POST_EDIT,
  UPDATE_POST_EDITOR,
  UPDATE_POST,
  UPLOAD_DOC,
  UPLOAD_IMAGE
} from '../actions'

import { NEW_POST_PLACEHOLDER_ID } from '../components/PostEditor'

const stateWithImage = (state, id, url) => {
  let post = state[id]
  let media = (post.media || []).filter(m => m.type !== 'image')
  if (url) media = media.concat({type: 'image', url})
  return {
    ...state,
    [id]: {...post, media}
  }
}

const stateWithDoc = (state, id, doc) => {
  let post = state[id]
  let media = uniq((post.media || []).concat([doc]), m => m.url)
  return {
    ...state,
    [id]: {...post, media}
  }
}

const stateWithoutDoc = (state, id, doc) => {
  let post = state[id]
  let media = (post.media || []).filter(m => m.url !== doc.url)
  return {
    ...state,
    [id]: {...post, media}
  }
}

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  let { id } = meta || {}
  switch (type) {
    case UPDATE_POST_EDITOR:
      return {
        ...state,
        [id]: {...state[id], ...payload}
      }
    case CREATE_POST:
      return {...state, [NEW_POST_PLACEHOLDER_ID]: null}
    case UPDATE_POST:
    case CANCEL_POST_EDIT:
      return {...state, [id]: null}
    case START_POST_EDIT:
      return {...state, [payload.id]: {...payload, expanded: true}}
    case UPLOAD_IMAGE:
      return stateWithImage(state, id, payload)
    case REMOVE_IMAGE:
      return stateWithImage(state, id, null)
    case UPLOAD_DOC:
      return stateWithDoc(state, id, payload)
    case REMOVE_DOC:
      return stateWithoutDoc(state, id, payload)
  }

  return state
}
