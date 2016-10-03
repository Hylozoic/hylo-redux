import {
  appendPayloadByPath, composeReducers, keyedCounter, mergeList
} from './util'
import {
  CREATE_COMMUNITY, FETCH_CURRENT_USER, FETCH_LEFT_NAV_TAGS, FETCH_LIVE_STATUS,
  FETCH_TAG, FETCH_TAGS, FETCH_TAG_SUMMARY, FOLLOW_TAG_PENDING, REMOVE_TAG
} from '../actions'
import { filter, fromPairs, merge, omitBy, toPairs } from 'lodash'
import { get, pickBy, some } from 'lodash/fp'
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
  const mergeLeftNavTags = (state, payload) => {
    return toPairs(payload).reduce((m, [ slug, tags ]) => {
      const newTags = tags.map(f => ({...f, followed: true}))
      const isInNewTagsOrNotFollowed = (v, k) =>
        some(t => t.name === k, newTags) || !v.followed
      const existingTags = pickBy(isInNewTagsOrNotFollowed, m[slug] || {})
      const mergedTags = mergeList(existingTags, newTags, 'name')
      return {...m, [slug]: mergedTags}
    }, state)
  }

  // meta.id here is whatever params.id is in CommunityProfile, i.e. a slug
  let { type, payload, meta, error } = action
  if (error) return state

  let oldCommunityTags, oldTag

  switch (type) {
    case FETCH_TAG:
      oldCommunityTags = state[meta.id] || {}
      return {
        ...state,
        [meta.id]: {...oldCommunityTags, [meta.tagName]: payload}
      }
    case FETCH_LEFT_NAV_TAGS:
      return mergeLeftNavTags(state, payload)
    case FETCH_LIVE_STATUS:
    case FETCH_CURRENT_USER:
    case CREATE_COMMUNITY:
      return mergeLeftNavTags(state, get('left_nav_tags', payload))
    case FOLLOW_TAG_PENDING:
      oldCommunityTags = state[meta.id] || {}
      oldTag = oldCommunityTags[meta.tagName]
      return {
        ...state,
        [meta.id]: {
          ...oldCommunityTags,
          [meta.tagName]: {...oldTag, followed: !oldTag.followed}
        }
      }
    case FETCH_TAG_SUMMARY:
      oldCommunityTags = state[meta.id] || {}
      oldTag = oldCommunityTags[meta.tagName]
      return {
        ...state,
        [meta.id]: {
          ...oldCommunityTags,
          [meta.tagName]: {...oldTag, ...payload}
        }
      }
    case REMOVE_TAG:
      return {
        ...state,
        [meta.slug]: omitBy(state[meta.slug], t => t.name === meta.name)
      }
    case FETCH_TAGS:
      const slug = qs.parse(meta.cache.id).id
      const itemsObj = {
        [slug]: fromPairs(payload.items.map(tag => [tag.name, tag]))
      }
      return merge({}, state, itemsObj)
  }
  return state
}
