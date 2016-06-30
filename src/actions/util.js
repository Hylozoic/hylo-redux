import { find, get } from 'lodash'
import { updateUserSettings, setCurrentCommunityId } from './index'

export const findError = (errors, type, bucket, id) => {
  let match = action =>
    get(action, 'meta.cache.id') === id &&
    get(action, 'meta.cache.bucket') === bucket

  return get(find([errors[type]], match), 'payload.response')
}

export const setCurrentCommunityIdLocalAndRemote = (dispatch, communityId, userId) => {
  if (!communityId) return
  const settings = {currentCommunityId: communityId}
  userId && dispatch(updateUserSettings(userId, {settings}))
  return dispatch(setCurrentCommunityId(communityId))
}
