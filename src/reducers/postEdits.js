import { includes, mapValues, startCase, uniq } from 'lodash'
import {
  CANCEL_POST_EDIT,
  CANCEL_TAG_DESCRIPTION_EDIT,
  CREATE_POST,
  EDIT_TAG_DESCRIPTION,
  REMOVE_DOC,
  REMOVE_IMAGE,
  START_POST_EDIT,
  UPDATE_POST_EDITOR,
  UPDATE_POST,
  UPLOAD_DOC,
  UPLOAD_IMAGE
} from '../actions'
import { updateMedia } from './util'
import { prepareHashtagsForEditing } from '../util/linkify'
import { invalidCharacterRegex } from '../models/hashtag'

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

const suggestedTag = text => {
  if (!text) return
  return startCase(text).split(' ').slice(0, 4).join('')
  .replace(invalidCharacterRegex, '')
}

const withSuggestedTag = (payload, state, id) => {
  const postEdit = state[id] || {}
  if (postEdit.id ||
    postEdit.tagEdited ||
    !includes(['event', 'project'], postEdit.type)) return payload

  return {
    tag: suggestedTag(payload.name || postEdit.name),
    ...payload
  }
}

export default function (state = {}, action) {
  const { type, payload, meta, error } = action
  if (error) return state

  const { subject, id } = meta || {}
  switch (type) {
    case UPDATE_POST_EDITOR:
      if (payload.video) {
        return {
          ...state,
          [id]: updateMedia(state[id], 'video', payload.video)
        }
      }
      return {
        ...state,
        [id]: {...state[id], ...withSuggestedTag(payload, state, id)}
      }
    case CREATE_POST:
    case UPDATE_POST:
    case CANCEL_POST_EDIT:
      return {...state, [id]: null}
    case START_POST_EDIT:
      return {...state, [payload.id]: {
        ...payload,
        description: prepareHashtagsForEditing(payload.description)
      }}
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

export const editingTagDescriptions = (state = false, action) => {
  const { type, error, payload } = action
  if (type === CANCEL_TAG_DESCRIPTION_EDIT) {
    return false
  } else if (type === CREATE_POST && error) {
    const response = JSON.parse(payload.response.body)
    return !!response.tagsMissingDescriptions
  }

  return state
}

export const tagDescriptionEdits = (state = {}, action) => {
  const { type, error, payload } = action
  if (type === CREATE_POST && error) {
    const response = JSON.parse(payload.response.body)
    if (response.tagsMissingDescriptions) {
      return {
        ...mapValues(response.tagsMissingDescriptions, () => ''),
        ...state
      }
    }
  } else if (includes([START_POST_EDIT, CANCEL_POST_EDIT], type)) {
    return {}
  } else if (type === EDIT_TAG_DESCRIPTION) {
    return {...state, [payload.tag]: payload.description}
  }

  return state
}
