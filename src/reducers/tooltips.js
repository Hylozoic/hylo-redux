import { omit } from 'lodash/fp'
import {
  REGISTER_TOOLTIP,
  UNREGISTER_TOOLTIP
} from '../constants'

export default function (state = {}, action) {
  const { type, error, payload } = action
  if (error) return state

  switch (type) {
    case REGISTER_TOOLTIP:
      return {
        ...state,
        [payload.id]: payload.index
      }
    case UNREGISTER_TOOLTIP:
      return omit(payload.id, state)
  }

  return state
}
