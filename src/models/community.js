import { values } from 'lodash'
import { find, pickBy } from 'lodash/fp'

export const MemberRole = {DEFAULT: 0, MODERATOR: 1}
export const defaultBanner = 'https://d3ngex8q79bk55.cloudfront.net/misc/default_community_banner.jpg'
export const defaultAvatar = 'https://d3ngex8q79bk55.cloudfront.net/misc/default_community_avatar.png'

export const avatarUploadSettings = ({ id, slug }) => ({
  id: slug,
  subject: 'community-avatar',
  path: `community/${id}/avatar`,
  convert: {width: 160, height: 160, fit: 'crop', rotate: 'exif'}
})

export const bannerUploadSettings = ({ id, slug }) => ({
  id: slug,
  subject: 'community-banner',
  path: `community/${id}/banner`,
  convert: {width: 1600, format: 'jpg', fit: 'max', rotate: 'exif'}
})

export const getCommunity = (idOrSlug, state) =>
  state.communities[idOrSlug] || find(c => c.id === idOrSlug, state.communities)

export const getCurrentCommunity = state =>
  getCommunity(state.currentCommunityId, state)

export const getFollowedTags = ({ slug }, state) =>
  values(pickBy('followed', state.tagsByCommunity[slug]))
