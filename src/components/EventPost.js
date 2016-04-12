import React from 'react'
import { timeRangeBrief, timeRangeFull } from '../util/text'
import { changeEventResponse } from '../actions'
import A from './A'
import RSVPControl from './RSVPControl'
import { get, find } from 'lodash'
import { same } from '../models'
import { imageUrl } from '../models/post'
const { func, object } = React.PropTypes

const spacer = <span>&nbsp; •&nbsp; </span>

const EventPost = ({ post }) => {
  const { start_time, end_time, user, id, name } = post
  const start = new Date(start_time)
  const end = end_time && new Date(end_time)
  const time = timeRangeBrief(start, end)
  const timeFull = timeRangeFull(start, end)

  const project = 'Stop Trump'
  const url = `/p/${id}`
  const backgroundImage = `url(${imageUrl(post)})`

  return <div className='post event'>
    <A className='image' to={url} style={{backgroundImage}}/>
    <div className='meta'>
      <span title={timeFull}>{time}</span>
      {spacer}
      {user.name}
      {project && <span>
        {spacer}
        <a>{project}</a>
      </span>}
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
