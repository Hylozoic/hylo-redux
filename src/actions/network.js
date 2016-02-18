import {
  CREATE_NETWORK,
  FETCH_NETWORK,
  UPDATE_NETWORK,
  UPDATE_NETWORK_EDITOR,
  VALIDATE_NETWORK_ATTRIBUTE,
  RESET_NETWORK_VALIDATION
} from './index'
import { cleanAndStringify } from '../util/caching'

export function createNetwork (params) {
  return {
    type: CREATE_NETWORK,
    payload: {api: true, params, path: '/noo/network', method: 'POST'}
  }
}

export function updateNetwork (id, params) {
  return {
    type: UPDATE_NETWORK,
    payload: {api: true, params, path: `/noo/network/${id}`, method: 'POST'}
  }
}

export function validateNetworkAttribute (key, value, constraint) {
  return {
    type: VALIDATE_NETWORK_ATTRIBUTE,
    payload: {api: true, params: {column: key, value, constraint}, path: '/noo/network/validate', method: 'POST'},
    meta: {key}
  }
}

export function resetNetworkValidation (key) {
  return {
    type: RESET_NETWORK_VALIDATION,
    meta: {key}
  }
}

export function updateNetworkEditor (id, payload) {
  return {
    type: UPDATE_NETWORK_EDITOR,
    payload,
    meta: {id}
  }
}

export function fetchNetwork (id, withCommunityIds) {
  var path = `/noo/network/${id}`
  if (withCommunityIds) {
    path += '?' + cleanAndStringify({withCommunityIds: true})
  }
  return {
    type: FETCH_NETWORK,
    payload: {api: true, path: path},
    meta: {cache: {bucket: 'networks', id, requiredProp: 'banner_url'}}
  }
}
