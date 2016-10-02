import { find, get } from 'lodash'
import { updateUserSettings, setCurrentCommunityId } from './index'

export const findError = (errors, type, bucket, id) => {
  let match = action =>
    get(action, 'meta.cache.id') === id &&
    get(action, 'meta.cache.bucket') === bucket

  return get(find([errors[type]], match), 'payload.response')
}

// FIXME this shouldn't go in here; actions/util is for functions used only
// within actions
export const saveCurrentCommunityId = (dispatch, communityId, isLoggedIn) => {
  if (!communityId) return
  const settings = {currentCommunityId: communityId}
  if (isLoggedIn && typeof window !== 'undefined') {
    setTimeout(() => dispatch(updateUserSettings({settings})), 2000)
  }
  return dispatch(setCurrentCommunityId(communityId))
}
