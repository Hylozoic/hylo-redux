import { get, sortBy } from 'lodash'

export const avatarUploadSettings = person => ({
  id: person.id,
  subject: 'user-avatar',
  path: `user/${person.id}/avatar`,
  convert: {width: 200, height: 200, fit: 'crop', rotate: 'exif'}
})

export const bannerUploadSettings = person => ({
  id: person.id,
  subject: 'user-banner',
  path: `user/${person.id}/banner`,
  convert: {width: 1600, format: 'jpg', fit: 'max', rotate: 'exif'}
})

export const mostRecentCommunity = person => {
  var reverseDate = m => -Date.parse(m.last_viewed_at || '2001-01-01')
  return get(sortBy(person.memberships, reverseDate), '0.community')
}

export const getPerson = (id, state) => state.people[id]

export const defaultBanner = 'https://d3ngex8q79bk55.cloudfront.net/misc/default_user_banner.jpg'
