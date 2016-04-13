import React from 'react'
import { connect } from 'react-redux'
import { timeRange, timeRangeBrief, timeRangeFull } from '../util/text'
import { changeEventResponse } from '../actions'
import A from './A'
import Icon from './Icon'
import RSVPControl from './RSVPControl'
import { ClickCatchingSpan } from './ClickCatcher'
import { get, find } from 'lodash'
import { same } from '../models'
import { getComments, getCommunities, imageUrl } from '../models/post'
import { Header, CommentSection } from './Post'
import decode from 'ent/decode'
import { present, sanitize } from '../util/text'
const { array, func, object } = React.PropTypes

const spacer = <span>&nbsp; •&nbsp; </span>

export const EventPostCard = ({ post }) => {
  const { start_time, end_time, user, id, name } = post
  const start = new Date(start_time)
  const end = end_time && new Date(end_time)
  const time = timeRangeBrief(start, end)
  const timeFull = timeRangeFull(start, end)

  const hashtag = '#todo'
  const url = `/p/${id}`
  const backgroundImage = `url(${imageUrl(post)})`

  return <div className='post event-summary'>
    <A className='image' to={url} style={{backgroundImage}}/>
    <div className='meta'>
      <span title={timeFull}>{time}</span>
      {spacer}
      <a className='hashtag'>{hashtag}</a>
      {spacer}
      <A to={`/u/${user.id}`}>{user.name}</A>
    </div>
    <A className='title' to={url}>{name}</A>
    <div className='attendees'>
      <Attendance post={post}/>
    </div>
  </div>
}

const Attendance = ({ post }, { currentUser, dispatch }) => {
  const { responders } = post
  let currentResponse = get(find(responders, same('id', currentUser)), 'response') || ''
  let onPickResponse = currentUser &&
    (choice => dispatch(changeEventResponse(post.id, choice, currentUser)))

  return <RSVPControl {...{responders, currentResponse, onPickResponse}}/>
}
Attendance.contextTypes = {currentUser: object, dispatch: func}

@connect((state, { post }) => ({
  comments: getComments(post, state),
  communities: getCommunities(post, state)
}))
export default class EventPost extends React.Component {
  static propTypes = {
    post: object,
    communities: array,
    comments: array
  }

  static childContextTypes = {
    post: object
  }

  getChildContext () {
    return {post: this.props.post}
  }

  render () {
    const { post, communities, comments } = this.props
    const { name, start_time, end_time, location } = post
    const description = present(sanitize(post.description))
    const title = decode(name || '')
    const start = new Date(start_time)
    const end = end_time && new Date(end_time)

    return <div className='post event'>
      <Header communities={communities}/>
      <p className='title post-section'>{title}</p>
      <p className='hashtag'>#hashtagTBD</p>

      <div className='event-details'>
        <div className='attendees'>
          attendees
        </div>
        <div className='time'>
          <Icon name='time'/>
          <span title={timeRangeFull(start, end)}>
            {timeRange(start, end)}
          </span>
        </div>
        <div className='location'>
          <Icon name='map-marker'/>
          <span title={location}>{location}</span>
        </div>
        <div className='detail-text'>
          <ClickCatchingSpan dangerouslySetInnerHTML={{__html: description}}/>
        </div>
      </div>

      <CommentSection comments={comments}/>
    </div>
  }
}
