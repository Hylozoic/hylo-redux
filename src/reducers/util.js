import { cloneDeep, filter, isEqual, merge, set, some, transform, uniq } from 'lodash'

export function appendUniq (state, key, values) {
  let existing = state[key] || []
  return concatUniq(state, key, existing, values)
}

export function prependUniq (state, key, values) {
  let existing = state[key] || []
  return concatUniq(state, key, values, existing)
}

export function concatUniq (state, key, first, second) {
  return {
    ...state,
    [key]: uniq(first.concat(second))
  }
}

export const hashBy = (objects, prop) => {
  let fn = typeof prop === 'function'
    ? (r, n) => r[prop(n)] = n
    : (r, n) => r[n[prop]] = n
  return transform(objects, fn, {})
}

// for modifying a post, project, or other object with a list of media; set an
// item of specified type if url is set, and remove it otherwise. assumes that
// there is can be only one item of specified type, so it should be used with
// images and videos in the current implementation but not docs.
export function updateMedia (obj, type, url) {
  let media = filter(obj && obj.media, m => m.type !== type)
  if (url) media = media.concat({type, url})
  return {...obj, media}
}

// merge a list of items with existing data so that within an item, we don't
// replace a long list of properties with a shorter one, but we do pick up
// recent changes
export const mergeList = (state, items, key) => {
  let mergedItems = items.reduce((m, x) => {
    let id = x[key]
    m[id] = merge({...state[id]}, x)
    return m
  }, {})

  return {...state, ...mergedItems}
}

export const cloneSet = (state, path, value) => {
  let newState = cloneDeep(state)
  set(newState, path, value)
  return newState
}

export const toggleIncludes = (arr, element) => {
  return some(arr, x => isEqual(x, element))
    ? filter(arr, x => !isEqual(x, element))
    : [...arr, element]
}
