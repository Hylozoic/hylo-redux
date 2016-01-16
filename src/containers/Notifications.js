import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetchActivity, markActivityRead, markAllActivitiesRead, navigate, thank } from '../actions'
import { values, sortBy, isEmpty, contains } from 'lodash'
import cx from 'classnames'
import ScrollListener from '../components/ScrollListener'
import A from '../components/A'
import truncate from 'html-truncate'
import { present, humanDate } from '../util/text'
const { array, bool, func, number, object } = React.PropTypes

@prefetch(({ dispatch }) => dispatch(fetchActivity(20, 0)))
@connect(state => ({
  activities: sortBy(values(state.activities), ['created_at']).reverse(),
  total: Number(state.totalActivities)
}))
export default class Notifications extends React.Component {

  static propTypes = {
    activities: array,
    pending: bool,
    dispatch: func,
    total: number,
    currentUser: object
  }

  loadMore = () => {
    let { total, activities, dispatch, pending } = this.props
    let offset = activities.length
    if (!pending && offset < total) {
      dispatch(fetchActivity(20, offset))
    }
  }

  markAllRead = () => {
    let { dispatch } = this.props
    dispatch(markAllActivitiesRead())
  }

  visit = activity => {
    let { dispatch } = this.props
    let path = `/p/${activity.post.id}`
    if (activity.unread) {
      dispatch(markActivityRead(activity.id))
    }
    dispatch(navigate(path))
  }

  thank = activity => {
    let { dispatch } = this.props
    let {comment} = activity
    dispatch(thank(comment.id, activity.id))
  }

  render () {
    let { activities } = this.props

    return <div>
      <div className='row'>
        <div className='col-sm-6'>
          <h2>Notifications</h2>
        </div>
        <div className='col-sm-6'>
          <div className='list-controls'>
            <button onClick={this.markAllRead}>
              Mark all as read
            </button>
          </div>
        </div>
      </div>
      <div className='activities'>
        {activities.map(activity => <Activity key={activity.id} activity={activity} visit={this.visit} thank={this.thank}/>)}
        <ScrollListener onBottom={this.loadMore}/>
      </div>
    </div>
  }
}

const Activity = props => {
  let { activity, visit, thank } = props
  let { actor, post, comment } = activity

  let bodyText = activity => {
    if (contains(['followAdd', 'follow', 'unfollow'], activity.action)) {
      return ''
    }
    let text = activity.comment.comment_text || activity.post.description
    return present(text, {communityId: activity.post.communities[0].id, maxlength: 200})
  }(activity)

  let actionText = activity => {
    switch (activity.action) {
      case 'mention':
        if (isEmpty(activity.comment)) {
          return 'mentioned you in their ' + activity.post.type
        } else {
          return 'mentioned you in a comment on'
        }
        break
      case 'comment':
        return 'commented on'
      case 'followAdd':
        return 'added you to the ' + activity.post.type
      case 'follow':
        return 'followed'
      case 'unfollow':
        return 'stopped following'
    }
  }(activity) + ' '

  let postName = post.type === 'welcome'
  ? `${post.relatedUsers[0].name}'s' welcoming post`
  : truncate(post.name, 140)

  let timeAgo = humanDate(activity.created_at)
  let isThanked = comment && comment.thanks && comment.thanks[0]
  let actorFirstName = actor.name.split(' ')[0]

  return <div key={activity.id} className={cx('activity', {'unread': activity.unread})}>
    <div>
      <A to={`/u/${actor.id}`}>
        <div className='avatar' style={{backgroundImage: `url(${actor.avatar_url})`}} />
      </A>
    </div>
    <div className='content'>
      <div className='title'>
        {actor.name} {actionText}
        <a onClick={() => visit(activity)}>
          {postName}
        </a>
      </div>

      {bodyText && <div className='body-text' dangerouslySetInnerHTML={{__html: bodyText}} />}

      <div className='controls'>
        {timeAgo}
        {!isEmpty(comment) && <span>
          &nbsp;&nbsp;•&nbsp;&nbsp;
          <span>
            {isThanked
            ? <a tooltip='click to take back your "Thank You"' tooltip-popup-delay='500' onClick={() => thank(activity)}>
                  You thanked <span>{actorFirstName}</span>
                </a>
            : <a tooltip='click to give thanks for this comment' tooltip-popup-delay='500' onClick={() => thank(activity)}>Say "Thank you"</a>}
            &nbsp;&nbsp;•&nbsp;&nbsp;
          </span>
          <a onClick={() => visit(activity)}>Reply</a>
        </span>}
      </div>
    </div>
  </div>
}
