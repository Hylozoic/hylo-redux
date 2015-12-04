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
