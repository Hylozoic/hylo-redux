import {
  appendPayloadByPath, composeReducers, keyedCounter, mergeList
} from './util'
import {
  FETCH_LEFT_NAV_TAGS, FETCH_LIVE_STATUS, FETCH_TAG, FETCH_TAGS,
  FOLLOW_TAG_PENDING, REMOVE_TAG
} from '../actions'
import { filter, get, isEmpty, merge, omitBy, toPairs } from 'lodash'
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

export const tagsByCommunity = (state = {}, action) => {
  const mergeLeftNavTags = (state, leftNavTags, id) => {
    if (isEmpty(leftNavTags)) return state
    let labeledTags = leftNavTags.followed.map(f => merge(f, {followed: true}))
    .concat(leftNavTags.created.map(c => merge(c, {created: true})))
    return {
      ...state,
      [id]: mergeList(state[id] || {}, labeledTags, 'name')
    }
  }

  // meta.id here is whatever params.id is in CommunityProfile, i.e. a slug
  let { type, payload, meta, error } = action
  if (error) return state

  switch (type) {
    case FETCH_TAG:
      let oldCommunityTags = state[meta.id] || {}
      return {
        ...state,
        [meta.id]: {
          ...oldCommunityTags,
          [meta.tagName]: payload
        }
      }
    case FETCH_LEFT_NAV_TAGS:
      return mergeLeftNavTags(state, payload, meta.id)
    case FETCH_LIVE_STATUS:
      return mergeLeftNavTags(state, payload.left_nav_tags, get(meta, 'slug'))
    case FOLLOW_TAG_PENDING:
      oldCommunityTags = state[meta.id] || {}
      var oldTag = oldCommunityTags[meta.tagName]
      return {
        ...state,
        [meta.id]: {
          ...oldCommunityTags,
          [meta.tagName]: {...oldTag, followed: !oldTag.followed}
        }
      }
    case REMOVE_TAG:
      return {
        ...state,
        [meta.slug]: omitBy(state[meta.slug], t => t.name === meta.name)
      }
  }
  return state
}
