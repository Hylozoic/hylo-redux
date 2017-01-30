import { get, pick } from 'lodash/fp'
import { makeUrl } from '../util/navigation'
import { cleanAndStringify, createCacheId } from '../util/caching'
import {
  FETCH_CONTRIBUTIONS,
  FETCH_PEOPLE,
  FETCH_PERSON,
  FETCH_THANKS
} from '../constants'

export function fetchPeople (opts) {
  let { subject, id, limit, offset, search, cacheId } = opts
  if (!cacheId) cacheId = createCacheId(subject, id, {search})
  if (!offset) offset = 0
  const cache = {id: cacheId, bucket: 'peopleByQuery', limit, offset, array: true}
  let querystring, path

  switch (subject) {
    case 'community':
      querystring = cleanAndStringify({search, limit, offset})
      path = id === 'all'
        ? `/noo/user?${querystring}`
        : `/noo/community/${id}/members?${querystring}`
      break
    case 'network':
      querystring = cleanAndStringify({search, limit, offset})
      path = `/noo/network/${id}/members?${querystring}`
      break
  }

  return {type: FETCH_PEOPLE, payload: {api: true, path}, meta: {cache}}
}

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
