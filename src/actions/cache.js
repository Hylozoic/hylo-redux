import { CLEAR_CACHE } from './constants'

export function clearCache (bucket, id) {
  return {
    type: CLEAR_CACHE,
    payload: {bucket, id}
  }
}
