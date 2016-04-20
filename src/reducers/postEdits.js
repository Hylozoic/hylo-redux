import { startCase, uniq } from 'lodash'
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
import { updateMedia } from './util'

const stateWithDoc = (state, id, doc) => {
  let obj = state[id]
  let media = uniq((obj.media || []).concat([doc]), m => m.url)
  return {
    ...state,
    [id]: {...obj, media}
  }
}

const stateWithoutDoc = (state, id, doc) => {
  let obj = state[id]
  let media = (obj.media || []).filter(m => m.url !== doc.url)
  return {
    ...state,
    [id]: {...obj, media}
  }
}

const suggestedTag = text =>
  startCase(text).split(' ').slice(0, 4).join('')

const withSuggestedTag = (payload, state, id) => {
  const postEdit = state[id] || {}
  if (postEdit.id ||
    postEdit.tagManuallyEdited ||
    postEdit.type !== 'event') return payload

  return {
    ...payload,
    tag: suggestedTag(payload.name)
  }
}

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  let { subject, id } = meta || {}
  switch (type) {
    case UPDATE_POST_EDITOR:
      return {
        ...state,
        [id]: {...state[id], ...withSuggestedTag(payload, state, id)}
      }
    case CREATE_POST:
    case UPDATE_POST:
    case CANCEL_POST_EDIT:
      return {...state, [id]: null}
    case START_POST_EDIT:
      return {...state, [payload.id]: {...payload, expanded: true}}
    case UPLOAD_IMAGE:
    case REMOVE_IMAGE:
      if (subject === 'post') {
        return {
          ...state,
          [id]: updateMedia(state[id], 'image', payload)
        }
      }
      break
    case UPLOAD_DOC:
      return stateWithDoc(state, id, payload)
    case REMOVE_DOC:
      return stateWithoutDoc(state, id, payload)
  }

  return state
}
