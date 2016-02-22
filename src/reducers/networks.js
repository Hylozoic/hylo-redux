import { debug } from '../util/logging'
import {
  CREATE_NETWORK,
  FETCH_NETWORK
} from '../actions'

export default function (state = {}, action) {
  let { error, type, payload, meta } = action
  if (error) {
    return state
  }

  switch (type) {
    case FETCH_NETWORK:
      let slug = payload.slug || meta.cache.id
      let network = {...state[slug], ...payload}
      debug('caching network:', network.slug)
      return {...state, [slug]: network}
    case CREATE_NETWORK:
      return {
        ...state,
        [payload.slug]: payload
      }
  }
  return state
}
