import { debug } from '../util/logging'
import { map } from 'lodash'
import {
  CREATE_NETWORK,
  FETCH_NETWORK,
  FETCH_COMMUNITIES
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
      return {...state, [slug]: {...state[slug], ...network}}
    case CREATE_NETWORK:
      return {
        ...state,
        [payload.slug]: payload
      }
    case FETCH_COMMUNITIES:
      let { id } = meta
      let newCommunities = (state[id].communities || []).concat(map(payload.communities, 'id'))
      return {...state, [id]: {...state[id], communities: newCommunities}}
  }
  return state
}
