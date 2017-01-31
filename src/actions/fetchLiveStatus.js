import { FETCH_LIVE_STATUS } from './constants'

export function fetchLiveStatus (communityId, slug) {
  const path = `/noo/live-status${communityId ? `?communityId=${communityId}` : ''}`
  return {
    type: FETCH_LIVE_STATUS,
    payload: {api: true, path},
    meta: {slug}
  }
}
