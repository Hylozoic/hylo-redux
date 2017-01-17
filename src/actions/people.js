import {
  FETCH_CONTRIBUTIONS,
  FETCH_PERSON,
  FETCH_THANKS
} from './index'
import { get, pick } from 'lodash/fp'
import { makeUrl } from '../util/navigation'

export function fetchPerson (id, query) {
  const pathOpts = pick('check-join-requests', query)
  return {
    type: FETCH_PERSON,
    payload: {api: true, path: makeUrl(`/noo/user/${id}`, pathOpts)},
    meta: {
      cache: {bucket: 'people', id, requiredProp: 'grouped_post_count'},
      addDataToStore: {
        people: get('people'),
        communities: get('communities')
      }
    }
  }
}

export function fetchThanks (id, query) {
  return {
    type: FETCH_THANKS,
    payload: {api: true, path: makeUrl(`/noo/user/${id}/thanks`, query)},
    meta: {id}
  }
}

export function fetchContributions (id, query) {
  return {
    type: FETCH_CONTRIBUTIONS,
    payload: {api: true, path: makeUrl(`/noo/user/${id}/contributions`, query)},
    meta: {id}
  }
}
