import { appendPayloadByPath, composeReducers, keyedCounter } from './util'
import { FETCH_TAGS, REMOVE_TAG } from '../actions'
import { filter, toPairs } from 'lodash'
import qs from 'querystring'

const matchesRemovedTag = (id, slug) => {
  const key = qs.parse(id)
  return key.subject === 'community' && key.id === slug
}

const filterOutRemovedTag = (state, { type, error, meta }) => {
  if (type !== REMOVE_TAG || error) return state
  const updated = toPairs(state).reduce((acc, [id, tags]) => {
    if (matchesRemovedTag(id, meta.slug)) {
      acc[id] = filter(tags, t => t.id !== meta.id)
    }
    return acc
  }, {})
  return {...state, ...updated}
}

const decrementForRemovedTag = (state, { type, error, meta }) => {
  if (type !== REMOVE_TAG || error) return state
  const updated = toPairs(state).reduce((acc, [id, count]) => {
    if (matchesRemovedTag(id, meta.slug)) {
      acc[id] = count - 1
    }
    return acc
  }, {})
  return {...state, ...updated}
}

export const tagsByQuery = composeReducers(
  appendPayloadByPath(FETCH_TAGS, 'meta.cache.id', 'items', t => t.id),
  filterOutRemovedTag
)

export const totalTagsByQuery = composeReducers(
  keyedCounter(FETCH_TAGS, 'total'),
  decrementForRemovedTag
)
