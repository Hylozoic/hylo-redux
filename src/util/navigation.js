import { isEmpty, omitBy } from 'lodash'
import qs from 'querystring'
import { tagUrl } from '../routes'
import { navigate } from '../actions'

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

export const navigateAfterJoin = ({ slug }, tagName, preexisting) =>
  preexisting
    ? navigate(tagName ? tagUrl(tagName, slug) : `/c/${slug}`)
    : navigate(makeUrl('/add-skills', {community: slug, tagName}))

export const nextOnboardingUrl = ({ pathname, query: { tagName, community } }) => {
  switch (pathname) {
    case '/add-skills':
      return makeUrl('/add-bio', {community, tagName})
    case '/add-bio':
      return makeUrl('/choose-topics', {community, tagName})
    case '/choose-topics':
      return tagName ? tagUrl(tagName, community) : `/c/${community}`
  }
}
