import { fetchCurrentUser, navigate } from '../actions'
import { getCommunity } from '../models/currentUser'
import { get } from 'lodash'
import qs from 'querystring'
import { communityUrl } from '../routes'

export const LOGIN_CONTEXT = 'login'
export const PROFILE_CONTEXT = 'profile'

let popup

export function openPopup (service, authContext) {
  var width, height

  if (service === 'google') {
    width = 420
    height = 480
  } else if (service === 'facebook') {
    width = 560
    height = 520
  } else if (service === 'linkedin') {
    width = 400
    height = 584
  }

  // n.b. positioning of the popup is off on Chrome with multiple displays
  let left = document.documentElement.clientWidth / 2 - width / 2
  let top = document.documentElement.clientHeight / 2 - height / 2

  let params = {
    returnDomain: window.location.origin,
    authContext
  }

  popup = window.open(
    `/noo/login/${service}?${qs.stringify(params)}`,
    `${service}Auth`,
    `width=${width}, height=${height}, left=${left}, top=${top}, titlebar=no, toolbar=no, menubar=no`
  )
  return popup
}

export function setupPopupCallback (name, dispatch, errorAction) {
  if (get(window, 'popupDone.callingContext') === name) return

  window.popupDone = opts => {
    let { context, error } = opts
    let next
    switch (context) {
      case LOGIN_CONTEXT:
        if (error) {
          dispatch(errorAction(error))
        } else {
          dispatch(errorAction(null))
          dispatch(fetchCurrentUser())
          .then(action => {
            if (action.error) return
            let params = qs.parse(window.location.search.replace(/^\?/, ''))

            const currentUser = action.payload
            const currentCommunityId = get(currentUser, 'settings.currentCommunityId')
            const community = getCommunity(currentUser, currentCommunityId)
            next = params.next || (community ? communityUrl(community) : `/u/${action.payload.id}`)
            return dispatch(navigate(next))
          })
        }
        break
      case PROFILE_CONTEXT:
        dispatch(fetchCurrentUser(true))
    }

    popup.close()
  }

  window.popupDone.callingContext = name

  // TODO remove event listener if it already exists

  window.addEventListener('message', ({ data }) => {
    if (data.type === 'third party auth') window.popupDone(data)
  })
}
