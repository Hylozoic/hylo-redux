import {
  ADD_DATA_TO_STORE
} from '../constants'

export function addDataToStore (bucket, payload, fromType) {
  return {
    type: ADD_DATA_TO_STORE,
    payload,
    meta: {bucket, fromType}
  }
}
