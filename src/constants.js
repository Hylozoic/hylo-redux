// i'm putting things in here that duplicate information in hylo-node.
// this pattern is definitely tentative and subject to change

export const ProjectVisibility = {COMMUNITY: 0, PUBLIC: 1}
export const ProjectMemberRole = {DEFAULT: 0, MODERATOR: 1}
export const CommunityMemberRole = {DEFAULT: 0, MODERATOR: 1}

export const communityAvatarUploadSettings = community => ({
  id: community.slug,
  subject: 'community-avatar',
  path: `community/${community.id}/avatar`,
  convert: {width: 160, height: 160, fit: 'crop', rotate: 'exif'}
})

export const communityBannerUploadSettings = community => ({
  id: community.slug,
  subject: 'community-banner',
  path: `community/${community.id}/banner`,
  convert: {width: 1600, format: 'jpg', fit: 'max', rotate: 'exif'}
})

export const userAvatarUploadSettings = user => ({
  id: user.id,
  subject: 'user-avatar',
  path: `user/${user.id}/avatar`,
  convert: {width: 200, height: 200, fit: 'crop', rotate: 'exif'}
})

export const userBannerUploadSettings = user => ({
  id: user.id,
  subject: 'user-banner',
  path: `user/${user.id}/banner`,
  convert: {width: 1600, format: 'jpg', fit: 'max', rotate: 'exif'}
})
