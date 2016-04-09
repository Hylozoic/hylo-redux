import { get, partial } from 'lodash'
import { mostRecentCommunity } from '../models/person'

// These strings were not used prior to hylo-redux
export const ADDED_PROJECT = 'Add project'
export const ADDED_COMMUNITY = 'Add community'
export const EDITED_PROJECT = 'Edit project'
export const EDITED_USER_SETTINGS = 'Edit user settings'
export const INVITED_COMMUNITY_MEMBERS = 'Invited community members'
export const INVITED_PROJECT_CONTRIBUTORS = 'Invited project contributors'

// These strings correspond to the names of events in Mixpanel with historical
// data, so they should be changed with care
export const ADDED_COMMENT = 'Post: Comment: Add'
export const ADDED_POST = 'Add Post'
export const CLICKTHROUGH = 'Clickthrough'
export const EDITED_POST = 'Edit Post'
export const LOGGED_IN = 'Login success'
export const SIGNED_UP = 'Signup success'
export const SHOWED_POST_COMMENTS = 'Post: Comments: Show'
export const STARTED_LOGIN = 'Login start'
export const STARTED_SIGNUP = 'Signup start'
export const VIEWED_COMMUNITY = 'Community: Load Community'
export const VIEWED_NOTIFICATIONS = 'Notifications: View'
export const VIEWED_PERSON = 'Member Profiles: Loaded a profile'
export const VIEWED_SELF = 'Member Profiles: Loaded Own Profile'

export function trackEvent (eventName, options = {}) {
  let { person, post, community, project, ...otherOptions } = options
  let track = partial(window.analytics.track, eventName)
  switch (eventName) {
    case ADDED_PROJECT:
    case EDITED_PROJECT:
    case INVITED_PROJECT_CONTRIBUTORS:
      track({
        project_id: project.id,
        community_slug: project.community.slug
      })
      break
    case ADDED_COMMUNITY:
    case VIEWED_COMMUNITY:
    case INVITED_COMMUNITY_MEMBERS:
      let { slug } = community
      track({community_slug: slug})
      break
    case VIEWED_PERSON:
      let { id, name } = person
      track({id, name})
      break
    case ADDED_COMMENT:
    case SHOWED_POST_COMMENTS:
      track({post_id: post.id})
      break
    case ADDED_POST:
    case EDITED_POST:
      track({
        post_id: post.id,
        post_tag: post.tag,
        community_id: community.id,
        project_id: get(project, 'id')
      })
      break
    case CLICKTHROUGH:
      track(otherOptions)
      break
    case EDITED_USER_SETTINGS:
    case LOGGED_IN:
    case STARTED_LOGIN:
    case STARTED_SIGNUP:
    case VIEWED_NOTIFICATIONS:
    case VIEWED_SELF:
      track()
      break
    default:
      throw new Error(`Don't know how to handle event named "${eventName}"`)
  }

  return Promise.resolve()
}

export const identify = person => {
  if (!person) return

  let { id, name, email, post_count, created_at } = person
  let community = mostRecentCommunity(person)
  let account = person.linkedAccounts[0]

  window.analytics.identify(id, {
    email, name, post_count, createdAt: created_at,
    provider: get(account, 'provider_key'),
    community_id: get(community, 'id'),
    community_name: get(community, 'name'),
    community_slug: get(community, 'slug')
  })
}
