import { compact, find, flow, get, map, reduce } from 'lodash/fp'
import { includes } from 'lodash'
import { FETCH_ACTIVITY } from '../actions'
import { present } from '../util/text'

const getActivities = (slug, state) => {
  const { activitiesByCommunity, activities } = state
  return map(id => activities[id], activitiesByCommunity[slug])
}

const getActivityComments = (activities, state) =>
  flow(
    map('comment_id'),
    compact,
    reduce((acc, cid) => ({...acc, [cid]: state.comments[cid]}), {})
  )(activities)

export const getActivitiesProps = (slug, state) => {
  const activities = getActivities(slug, state)

  return {
    activities,
    comments: getActivityComments(activities, state),
    total: Number(state.totalActivities[slug]),
    pending: state.pending[FETCH_ACTIVITY]
  }
}

export const actionText = (action, comment, post, reasons) => {
  switch (action) {
    case 'mention':
      if (!comment) return `mentioned you in their post`
      return 'mentioned you in a comment on'
    case 'comment':
      return 'commented on'
    case 'followAdd':
      return `added you to the post`
    case 'follow':
      return 'followed'
    case 'unfollow':
      return 'stopped following'
    case 'tag':
      const tagReason = find(r => r.startsWith('tag: '), reasons)
      const tag = tagReason.split(': ')[1]
      return `made a new post tagged with #${tag}:`
  }
}

export const bodyText = (action, comment, post) => {
  if (includes(['followAdd', 'follow', 'unfollow'], action)) {
    return ''
  }
  const text = get('text', comment) || get('description', post)
  const slug = get('communities.0.slug', post)
  return present(text, {slug, maxlength: 200})
}
