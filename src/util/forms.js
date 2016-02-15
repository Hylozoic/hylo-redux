import { get, set } from 'lodash'

export const pickPath = (object, path) =>
  set({}, path, get(object, path))

export const reversibleUpdate = (action, object, path, value) => {
  let attrs = set({}, path, value)
  let undoAttrs = set({}, path, get(object, path))

  // FIXME we have to use slug here instead of id for communities because that's
  // how they're keyed in the store... this smells
  return action(object.slug || object.id, attrs, undoAttrs)
}
