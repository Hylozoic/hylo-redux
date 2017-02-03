import { push } from 'react-router-redux'
import {
  TOGGLE_LEFT_NAV,
  RESET_ERROR,
  SET_CURRENT_COMMUNITY_ID,
  SET_CURRENT_NETWORK_ID,
  SET_MOBILE_DEVICE,
  SHOW_EXPANDED_POST,
  SHOW_DIRECT_MESSAGE
} from './constants'
import { showModal } from './modals'

export function navigate (path) {
  return push(path)
}

export function toggleLeftNav () {
  return {type: TOGGLE_LEFT_NAV}
}

export function resetError (type) {
  return {
    type: RESET_ERROR,
    meta: {type}
  }
}

export function setCurrentCommunityId (id) {
  return {type: SET_CURRENT_COMMUNITY_ID, payload: id}
}

export function setCurrentNetworkId (id) {
  return {type: SET_CURRENT_NETWORK_ID, payload: id}
}

export function setMobileDevice (enabled = true) {
  return {type: SET_MOBILE_DEVICE, payload: enabled}
}

export function showExpandedPost (id, commentId) {
  return {type: SHOW_EXPANDED_POST, payload: {id, commentId}}
}

export function showDirectMessage (userId, userName) {
  return {type: SHOW_DIRECT_MESSAGE, payload: {userId, userName}}
}

export const showImage = (url, fromUrl, isMobile) => {
  const encodeUrl = url => url.replace(/\//g, '%2F')

  if (isMobile) {
    return navigate(`/image/${encodeUrl(url)}/${encodeUrl(fromUrl)}`)
  } else {
    return showModal('image', {url})
  }
}
