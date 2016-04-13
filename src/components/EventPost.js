import React from 'react'
import { timeRangeBrief, timeRangeFull } from '../util/text'
import { changeEventResponse } from '../actions'
import A from './A'
import RSVPControl from './RSVPControl'
import { get, find } from 'lodash'
import { same } from '../models'
import { imageUrl } from '../models/post'
import { PostMenu } from './Post'
const { func, object } = React.PropTypes

const spacer = <span>&nbsp; •&nbsp; </span>

const EventPost = ({ post }) => {
  const { start_time, end_time, user, id, name } = post
  const start = new Date(start_time)
  const end = end_time && new Date(end_time)
  const time = timeRangeBrief(start, end)
  const timeFull = timeRangeFull(start, end)

  const hashtag = '#todo'
  const url = `/p/${id}`
  const backgroundImage = `url(${imageUrl(post)})`

  return <div className='post event'>
    <A className='image' to={url} style={{backgroundImage}}/>
    <PostMenu post={post}/>
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

export default EventPost

const Attendance = ({ post }, { currentUser, dispatch }) => {
  const { responders } = post
  let currentResponse = get(find(responders, same('id', currentUser)), 'response') || ''
  let onPickResponse = currentUser &&
    (choice => dispatch(changeEventResponse(post.id, choice, currentUser)))

  return <RSVPControl {...{responders, currentResponse, onPickResponse}}/>
}
Attendance.contextTypes = {currentUser: object, dispatch: func}
