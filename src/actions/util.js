import { find, get } from 'lodash'
import { updateUserSettings, setCurrentCommunityId } from './index'

export const findError = (errors, type, bucket, id) => {
  let match = action =>
    get(action, 'meta.cache.id') === id &&
    get(action, 'meta.cache.bucket') === bucket

  return get(find([errors[type]], match), 'payload.response')
}

export const saveCurrentCommunity = (dispatch, community, userId) => {
  if (!community) return
  const settings = {currentCommunityId: community.id}
  if (userId && typeof window !== 'undefined') {
    setTimeout(() => dispatch(updateUserSettings(userId, {settings})), 2000)
  }
  return dispatch(setCurrentCommunityId(community.id))
}
