import { isEmpty, omitBy } from 'lodash'
import qs from 'querystring'

export const makeUrl = (path, params) => {
  params = omitBy(params, x => !x)
  return `${path}${!isEmpty(params) ? '?' + qs.stringify(params) : ''}`
}

// when switching communities, this method determines whether to preserve the
// current subsection and query params
export const nextPath = (path, community, isNetwork, query) => {
  const pathStart = community ? `/${isNetwork ? 'n' : 'c'}/${community.slug}` : ''
  const match = community
    ? path.match(/(events|projects|people|notifications|about|invite)$/)
    : path.match(/(events|projects|people|notifications)$/)
  const pathEnd = match ? `/${match[1]}` : ''

  return makeUrl((pathStart + pathEnd) || '/app', query)
}
