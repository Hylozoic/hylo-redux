import { debug } from '../util/logging'
import { map } from 'lodash'
import {
  CREATE_NETWORK,
  FETCH_NETWORK,
  FETCH_COMMUNITIES,
  UPDATE_NETWORK_PENDING
} from '../actions/constants'

export default function (state = {}, action) {
  let { error, type, payload, meta } = action
  if (error) {
    return state
  }

  let { id } = meta || {}

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
      let newCommunities = (state[id].communities || []).concat(map(payload.communities, 'id'))
      return {...state, [id]: {...state[id], communities: newCommunities}}
    case UPDATE_NETWORK_PENDING:
      return {...state, [id]: {...state[id], ...meta.params}}
  }
  return state
}
