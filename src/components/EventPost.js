import React from 'react'
import { connect } from 'react-redux'
import { timeRange, timeRangeBrief, timeRangeFull } from '../util/text'
import { navigate } from '../actions'
import { changeEventResponse } from '../actions/posts'
import A from './A'
import Avatar from './Avatar'
import Select from './Select'
import Icon from './Icon'
import LazyLoader from './LazyLoader'
import LinkedPersonSentence from './LinkedPersonSentence'
import { ClickCatchingSpan } from './ClickCatcher'
import { get, find, isEmpty, some, sortBy } from 'lodash'
import { same } from '../models'
import { denormalizedPost, getComments, imageUrl } from '../models/post'
import { getCurrentCommunity } from '../models/community'
import { Header, presentDescription } from './Post'
import CommentSection from './CommentSection'
import decode from 'ent/decode'
import cx from 'classnames'
const { array, func, object } = React.PropTypes

const shouldShowTag = tag => tag && tag !== 'event'

export const EventPostCard = connect(
  (state, { post }) => ({
    comments: getComments(post, state),
    community: getCurrentCommunity(state),
    isMobile: state.isMobile,
    post: denormalizedPost(post, state)
  })
)(({ post, comments, community, isMobile, dispatch }) => {
  const { start_time, end_time, user, id, name } = post
  const start = new Date(start_time)
  const end = end_time && new Date(end_time)
  const time = timeRangeBrief(start, end)
  const timeFull = timeRangeFull(start, end)

  const description = presentDescription(post, community, {maxlength: 200})
  const url = `/p/${id}`
  const backgroundImage = `url(${imageUrl(post)})`

  return <div className='post event-summary'>
    <LazyLoader className='image'>
      <A to={url} style={{backgroundImage}}/>
    </LazyLoader>
    <div className='meta'>
      <A className='user-name' to={`/u/${user.id}`}>{user.name}</A>
      <span className='time' title={timeFull}>{time}</span>
    </div>
    <A className='title' to={url}>{name}</A>
    {!isMobile && description && <div className='details'>
      <ClickCatchingSpan dangerouslySetInnerHTML={{__html: description}}/>
    </div>}
    <Attendance post={post} showButton limit={7} alignRight/>
    <div className='comments-section-spacer'/>
    <CommentSection post={post} comments={comments}
      onExpand={() => dispatch(navigate(url))}/>
  </div>
})

const Attendance = ({ post, limit, showButton, className, children }, { currentUser }) => {
  const { responders } = post
  const going = sortBy(
    responders.filter(r => r.response === 'yes'),
    p => same('id', p, currentUser) ? 'Aaa' : p.name
  )

  return <div className={cx('attendance', className)}>
    {!isEmpty(going) && <LinkedPersonSentence people={going} className='blurb meta'>
      {going.length > 1 || some(going, same('id', currentUser)) ? 'are' : 'is'}
      &nbsp;going.
    </LinkedPersonSentence>}
    {going.length > 0 && <div className='going avatar-list'>
      {going.slice(0, limit).map(person =>
        <Avatar person={person} key={person.id}/>)}
    </div>}
    {currentUser && showButton && <RSVPSelect post={post}/>}
    {children}
  </div>
}
Attendance.contextTypes = {currentUser: object}

const RSVPSelect = ({ post, alignRight }, { currentUser, dispatch }) => {
  const options = [
    {name: "I'm Going", id: 'yes', className: 'yes'},
    {name: "Can't Go", id: 'no'}
  ]

  const onPickResponse = choice =>
    dispatch(changeEventResponse(post.id, choice.id, currentUser))

  const myResponse = find(post.responders, same('id', currentUser))
  const myResponseValue = get(myResponse, 'response') || ''
  const selected = myResponseValue === 'yes' ? options[0]
    : myResponseValue === 'no' ? options[1] : {name: 'RSVP'}

  return <Select className='rsvp' choices={options} selected={selected}
    alignRight={alignRight}
    onChange={onPickResponse}/>
}
RSVPSelect.contextTypes = {currentUser: object, dispatch: func}

const EventPost = (props, context) => {
  const { post, community, communities, comments } = context
  const { name, start_time, end_time, location, tag } = post
  const description = presentDescription(post, community)
  const title = decode(name || '')
  const start = new Date(start_time)
  const end = end_time && new Date(end_time)
  const image = imageUrl(post, false)

  return <div className='post event boxy-post'>
    <Header communities={communities}/>
    <p className='title post-section'>{title}</p>
    {shouldShowTag(tag) && <p className='hashtag'>#{tag}</p>}

    <div className='box'>
      {image && <div className='image'>
        <img src={image}/>
      </div>}
      <Attendance post={post} limit={5} showButton
        className={cx({'no-image': !image})}/>
      <div className='time'>
        <Icon name='Calendar'/>
        <span title={timeRangeFull(start, end)}>
          {timeRange(start, end)}
        </span>
      </div>
      <div className='location'>
        <Icon name='Pin-1'/>
        <span title={location}>{location}</span>
      </div>
      {description && <div className='details'>
        <ClickCatchingSpan dangerouslySetInnerHTML={{__html: description}}/>
      </div>}
    </div>

    <CommentSection post={post} comments={comments} expanded/>
  </div>
}
EventPost.contextTypes = {
  post: object,
  communities: array,
  comments: array
}

export default EventPost
