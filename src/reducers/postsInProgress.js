import { uniq } from 'lodash'

import {
  UPDATE_POST_EDITOR,
  CREATE_POST,
  UPDATE_POST,
  START_POST_EDIT,
  CANCEL_POST_EDIT,
  REMOVE_IMAGE
} from '../actions'

import { UPLOAD_IMAGE } from '../actions/uploadImage'
import { UPLOAD_DOC } from '../actions/uploadDoc'
import { REMOVE_DOC } from '../actions'

const stateWithImage = (state, context, url) => {
  let post = state[context]
  let media = (post.media || []).filter(m => m.type !== 'image')
  if (url) media = media.concat({type: 'image', url})
  return {
    ...state,
    [context]: {...post, media}
  }
}

const stateWithDoc = (state, context, doc) => {
  let post = state[context]
  let media = uniq((post.media || []).concat([doc]), m => m.url)
  return {
    ...state,
    [context]: {...post, media}
  }
}

const stateWithoutDoc = (state, context, doc) => {
  let post = state[context]
  let media = (post.media || []).filter(m => m.url !== doc.url)
  return {
    ...state,
    [context]: {...post, media}
  }
}

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  let { context } = meta || {}
  switch (type) {
    case UPDATE_POST_EDITOR:
      return {
        ...state,
        [context]: {...state[context], ...payload}
      }
    case CREATE_POST:
    case UPDATE_POST:
    case CANCEL_POST_EDIT:
      return {...state, [context]: null}
    case START_POST_EDIT:
      return {...state, [payload.id]: {...payload, expanded: true}}
    case UPLOAD_IMAGE:
      return stateWithImage(state, context, payload)
    case REMOVE_IMAGE:
      return stateWithImage(state, context, null)
    case UPLOAD_DOC:
      return stateWithDoc(state, context, payload)
    case REMOVE_DOC:
      return stateWithoutDoc(state, context, payload)
  }

  return state
}
