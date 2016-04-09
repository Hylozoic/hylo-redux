import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { defer, prefetch } from 'react-fetcher'
import { fetchActivity, FETCH_ACTIVITY, markActivityRead, markAllActivitiesRead, navigate, thank } from '../actions'
import { filter, get, includes } from 'lodash'
import cx from 'classnames'
import ScrollListener from '../components/ScrollListener'
import Avatar from '../components/Avatar'
import truncate from 'html-truncate'
import { present, humanDate } from '../util/text'
import { VIEWED_NOTIFICATIONS, trackEvent } from '../util/analytics'
import { commentUrl } from '../routes'
const { array, bool, func, number, object } = React.PropTypes

const Notifications = compose(
  prefetch(({ dispatch }) => dispatch(fetchActivity(0, true))),
  connect(({ people, comments, activities, totalActivities, pending }) => ({
    currentUser: people.current,
    activities,
    comments: filter(activities.map(a => a.comment_id)).reduce((acc, cid) => ({...acc, [cid]: comments[cid]}), {}),
    total: Number(totalActivities),
    pending: pending[FETCH_ACTIVITY]
  })),
  defer(() => trackEvent(VIEWED_NOTIFICATIONS))
)(({ activities, comments, currentUser, dispatch, total, pending }) => {
  let offset = activities.length
  let loadMore = !pending && offset < total
    ? () => dispatch(fetchActivity(offset))
    : () => {}

  return <div className='simple-page'>
    <div className='row'>
      <div className='col-sm-6'>
        <h2>Notifications</h2>
      </div>
      <div className='col-sm-6'>
        <div className='list-controls'>
          <button onClick={() => dispatch(markAllActivitiesRead())}>
            Mark all as read
          </button>
        </div>
      </div>
    </div>
    <div className='activities'>
      {activities.map(activity => {
        if (activity.comment_id) {
          activity = {
            ...activity,
            comment: comments[activity.comment_id]
          }
        }
        return <Activity key={activity.id} {...{activity, currentUser, dispatch}}/>
      })}
      <ScrollListener onBottom={loadMore}/>
    </div>
  </div>
})

Notifications.propTypes = {
  activities: array,
  comments: object,
  pending: bool,
  dispatch: func,
  total: number,
  currentUser: object
}

export default Notifications

let actionText = (action, comment, post) => {
  switch (action) {
    case 'mention':
      if (!comment) return `mentioned you in their ${post.tag}`
      return 'mentioned you in a comment on'
    case 'comment':
      return 'commented on'
    case 'followAdd':
      return `added you to the ${post.tag}`
    case 'follow':
      return 'followed'
    case 'unfollow':
      return 'stopped following'
  }
}

let bodyText = (action, comment, post) => {
  if (includes(['followAdd', 'follow', 'unfollow'], action)) {
    return ''
  }
  let text = get(comment, 'text') || get(post, 'description')
  return present(text, {communityId: post.communities[0].id, maxlength: 200})
}

const Activity = ({ activity, currentUser, dispatch }) => {
  let { actor, action, post, comment, comment_id, unread, created_at } = activity
  let { isThanked } = comment || {}
  const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

  let text = bodyText(action, comment, post)

  let postName = post.tag === 'welcome'
    ? `${post.relatedUsers[0].name}'s' welcoming post`
    : truncate(post.name, 140)

  let thankLinkText = isThanked
    ? `You thanked ${actor.name.split(' ')[0]}`
    : 'Say thanks'

  let thankTooltipText = isThanked
    ? 'click to take back your thanks'
    : 'click to give thanks for this comment'

  let visit = () => {
    if (unread) dispatch(markActivityRead(activity.id))
    dispatch(navigate(commentUrl({...comment, post_id: post.id})))
  }

  return <div key={activity.id} className={cx('activity', {unread})}>
    <Avatar person={actor}/>
    <div className='content'>
      <div className='title'>
        {actor.name} {actionText(action, comment, post)} <a onClick={visit}>{postName}</a>
      </div>

      {text && <div className='body-text' dangerouslySetInnerHTML={{__html: text}}/>}

      <div className='controls meta'>
        {humanDate(created_at)}
        {comment && <span>
          {spacer}
          <a tooltip={thankTooltipText} tooltip-popup-delay='500'
            onClick={() => dispatch(thank(comment_id, currentUser))}>
            {thankLinkText}
          </a>
          {spacer}
          <a onClick={visit}>Reply</a>
        </span>}
      </div>
    </div>
  </div>
}
