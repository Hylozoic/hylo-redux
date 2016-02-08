// These string literals correspond to the names of events in Mixpanel with
// historical data, so they should be changed with care
export const STARTED_LOGIN = 'Login start'
export const STARTED_SIGNUP = 'Signup start'
export const VIEWED_COMMUNITY = 'Community: Load Community'
export const VIEWED_PERSON = 'Member Profiles: Loaded a profile'
export const VIEWED_SELF = 'Member Profiles: Loaded Own Profile'

export function trackEvent (eventName, options) {
  let { track } = window.analytics
  switch (eventName) {
    case VIEWED_COMMUNITY:
      let { community: { slug } } = options
      track(eventName, {community_slug: slug})
      break
    case VIEWED_PERSON:
      let { person: { id, name } } = options
      track(eventName, {id, name})
      break
    case STARTED_LOGIN:
    case STARTED_SIGNUP:
    case VIEWED_SELF:
      track(eventName)
      break
    default:
      throw new Error(`Don't know how to handle event named "${name}"`)
  }

  return Promise.resolve()
}
