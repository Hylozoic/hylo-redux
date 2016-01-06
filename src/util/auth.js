import { upstreamHost } from '../../config'
import { fetchCurrentUser } from '../actions'

let popup

export function openPopup (service) {
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

  popup = window.open(
    `${upstreamHost}/noo/login/${service}?returnDomain=${window.location.origin}`,
    `${service}Auth`,
    `width=${width}, height=${height}, left=${left}, top=${top}, titlebar=no, toolbar=no, menubar=no`
  )
  return popup
}

export function setupPopupCallback (dispatch, errorAction) {
  window.popupDone = opts => {
    let { error } = opts
    if (error) {
      dispatch(errorAction(error))
    } else {
      dispatch(errorAction(null))
      dispatch(fetchCurrentUser())
      popup.close()
    }
  }

  window.addEventListener('message', ({ data }) => {
    if (data.type === 'third party auth') window.popupDone(data)
  })
}
