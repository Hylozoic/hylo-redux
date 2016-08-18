import { get, set } from 'lodash'

export const pickPath = (object, path) =>
  set({}, path, get(object, path))
