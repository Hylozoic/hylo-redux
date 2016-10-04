import { } from 'lodash'
import {
  UPDATE_MESSAGE_EDITOR
} from '../actions'

export default function (state = {}, action) {
  const { type, payload, error } = action
  if (error) return state

  switch (type) {
    case UPDATE_MESSAGE_EDITOR:
      return {...state, [payload.id]: payload.text}
  }

  return state
}
