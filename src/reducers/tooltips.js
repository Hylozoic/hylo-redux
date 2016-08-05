import {
  REGISTER_TOOLTIP
} from '../actions'

export default function (state = {}, action) {
  const { type, error, payload } = action
  if (error) return state

  switch (type) {
    case REGISTER_TOOLTIP:
      return {
        ...state,
        [payload.id]: payload.index
      }
  }

  return state
}
