import { cloneDeep, filter, isEqual, merge, set, some, transform, uniq } from 'lodash'

export const appendUniq = (state, key, values) =>
  concatUniq(state, key, state[key] || [], values)

export const prependUniq = (state, key, values) =>
  concatUniq(state, key, values, state[key] || [])

export const concatUniq = (state, key, first, second) => ({
  ...state,
  [key]: uniq(first.concat(second))
})

// given a list of items, produce an object where each item is keyed by the
// value of the iteratee (lodash's term for a function to apply or a property
// name to look up) for it
export const hashBy = (arr, iteratee) => {
  let fn = typeof iteratee === 'function'
    ? (r, n) => r[iteratee(n)] = n
    : (r, n) => r[n[iteratee]] = n
  return transform(arr, fn, {})
}

// for modifying a post or other object with a list of media; set an item of
// specified type if url is set, and remove it otherwise. assumes that there is
// can be only one item of specified type, so it should be used with images and
// videos in the current implementation but not docs.
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
