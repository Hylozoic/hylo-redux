import { FETCH_COMMUNITIES_FOR_NETWORK_NAV } from '../actions/constants'

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  switch (type) {
    case FETCH_COMMUNITIES_FOR_NETWORK_NAV:
      return {
        ...state,
        [meta.networkId]: payload
      }
  }
  return state
}
