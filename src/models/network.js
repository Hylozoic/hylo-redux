export const MemberRole = {DEFAULT: 0, MODERATOR: 1}

export const avatarUploadSettings = network => ({
  id: network.slug,
  subject: 'network-avatar',
  path: `network/${network.id}/avatar`,
  convert: {width: 160, height: 160, fit: 'crop', rotate: 'exif'}
})

export const bannerUploadSettings = network => ({
  id: network.slug,
  subject: 'network-banner',
  path: `network/${network.id}/banner`,
  convert: {width: 1600, format: 'jpg', fit: 'max', rotate: 'exif'}
})
