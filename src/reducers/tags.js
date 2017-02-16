import {
  appendPayloadByPath, composeReducers, keyedCounter, mergeList
} from './util'
import {
  CREATE_COMMUNITY,
  FETCH_CURRENT_USER,
  FETCH_LIVE_STATUS,
  FETCH_TAG,
  FETCH_TAGS,
  FETCH_TAG_SUMMARY,
  FOLLOW_TAG_PENDING,
  REMOVE_TAG,
  CREATE_POST,
  UPDATE_POST,
  CREATE_TAG_IN_COMMUNITY,
  FETCH_COMMUNITY,
  UPDATE_COMMUNITY_TAG
} from '../actions/constants'
import { filter, fromPairs, merge, omitBy, toPairs, isEmpty } from 'lodash'
import { get, pickBy, some, includes, mapValues, map } from 'lodash/fp'
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
  filterOutRemovedTag,
  (state, { type, meta }) => {
    // the gnarliness here is the result of majorly denormalized tags in this reducer
    if (type === UPDATE_COMMUNITY_TAG) {
      const key = `subject=community&id=${meta.slug}`
      return {
        ...state,
        [key]: map(t => {
          if (t.name !== meta.name) return t

          const newTag = {...t,
            memberships: map(m => {
              if (m.community_id !== meta.communityId) return m
              return {...m, ...meta.params}
            }, t.memberships)}

          return newTag
        }, state[key])
      }
    } else {
      return state
    }
  }
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
  let { slug, tagName, id } = meta || {}

  const addCreatedTags = (state, slug, createdTags) => {
    if (isEmpty(createdTags)) return state
    let tags = Object.keys(createdTags).map(key =>
      ({...createdTags[key], name: key, followed: true}))
    return {...state, [slug]: mergeList(state[slug], tags, 'name')}
  }

  switch (type) {
    case FETCH_TAG:
      oldCommunityTags = state[id] || {}
      return {
        ...state,
        [id]: {...oldCommunityTags, [payload.name]: payload}
      }
    case FETCH_LIVE_STATUS:
    case FETCH_CURRENT_USER:
    case CREATE_COMMUNITY:
      return mergeLeftNavTags(state, get('left_nav_tags', payload))
    case CREATE_POST:
      const { createdTags } = meta
      return addCreatedTags(state, slug, createdTags)
    case UPDATE_POST:
      const { params: { tagDescriptions } } = meta
      return addCreatedTags(state, slug, tagDescriptions)
    case CREATE_TAG_IN_COMMUNITY:
      let tags = [{...meta.tag, followed: true}]
      return {...state, [slug]: mergeList(state[slug], tags, 'name')}
    case FOLLOW_TAG_PENDING:
      oldCommunityTags = state[id] || {}
      oldTag = oldCommunityTags[tagName]
      return {
        ...state,
        [id]: {
          ...oldCommunityTags,
          [tagName]: {...oldTag, followed: !oldTag.followed}
        }
      }
    case FETCH_TAG_SUMMARY:
      oldCommunityTags = state[id] || {}
      oldTag = oldCommunityTags[tagName]
      return {
        ...state,
        [id]: {
          ...oldCommunityTags,
          [tagName]: {...oldTag, ...payload, name: tagName}
        }
      }
    case REMOVE_TAG:
      return {
        ...state,
        [meta.slug]: omitBy(state[meta.slug], t => t.name === meta.name)
      }
    case FETCH_TAGS:
      slug = qs.parse(meta.cache.id).id
      const itemsObj = {
        [slug]: fromPairs(payload.items.map(tag => [tag.name, tag]))
      }
      return merge({}, state, itemsObj)
    case FETCH_COMMUNITY:
      slug = payload.slug
      return {
        ...state,
        [slug]: mapValues(t => ({
          ...t,
          is_default: includes(t.name, payload.defaultTags)
        }), state[slug])
      }
    case UPDATE_COMMUNITY_TAG:
      oldTag = state[meta.slug][meta.name]
      const newTag = {...oldTag, ...meta.params}
      return {
        ...state,
        [meta.slug]: {...state[meta.slug], [meta.name]: newTag}
      }
  }
  return state
}
