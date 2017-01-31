import { FETCH_RAW_ADMIN_METRICS } from '../actions/constants'

export function admin (state = {}, action) {
  const { type, payload, error } = action
  if (error) return state
  switch (type) {
    case FETCH_RAW_ADMIN_METRICS:
      return {
        ...state,
        metrics: payload
      }
  }
  return state
}
