export function trackEvent (name, options) {
  switch (name) {
    case 'Community: Load Community':
      let { community: { slug } } = options
      window.analytics.track(name, {community_slug: slug})
      break
    default:
      throw new Error(`Don't know how to handle event named "${name}"`)
  }
}
