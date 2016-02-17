import { get, set } from 'lodash'

export const pickPath = (object, path) =>
  set({}, path, get(object, path))

export const reversibleUpdate = (action, object, path, value, hack) => {
  let attrs = set({}, path, value)
  if (hack === 'community') {
    attrs.slug = object.slug
  }
  let undoAttrs = set({}, path, get(object, path))
  return action(object.id, attrs, undoAttrs)
}
