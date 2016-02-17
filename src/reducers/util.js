import { filter, merge, transform, uniq } from 'lodash'

// for pagination -- append a new page of data to existing data if present,
// removing any duplicates.
export function appendUniq (state, key, data) {
  let existing = state[key] || []
  return {
    ...state,
    [key]: uniq(existing.concat(data), (v, i) => v.id)
  }
}

export function addIdsToState (state, key, objects) {
  return {
    ...state,
    [key]: uniq((state[key] || []).concat(objects.map(p => p.id)))
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
