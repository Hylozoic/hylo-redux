import {
  UPDATE_POST_EDITOR,
  CREATE_POST,
  UPDATE_POST,
  START_POST_EDIT,
  CANCEL_POST_EDIT,
  REMOVE_IMAGE
} from '../actions'

import { UPLOAD_IMAGE } from '../actions/uploadImage'

const stateWithNewImage = (state, context, url) => {
  let post = state[context]
  let media = (post.media || []).filter(m => m.type !== 'image')
  if (url) media = media.concat({type: 'image', url})
  return {
    ...state,
    [context]: {...post, media}
  }
}

export default function (state = {default: {}}, action) {
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
      return {
        ...state,
        [context]: null
      }
    case START_POST_EDIT:
      return {
        ...state,
        [payload.id]: payload
      }
    case UPLOAD_IMAGE:
      return stateWithNewImage(state, context, payload)
    case REMOVE_IMAGE:
      return stateWithNewImage(state, context, null)
  }

  return state
}
