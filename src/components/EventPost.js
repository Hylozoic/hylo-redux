import React from 'react'
import { connect } from 'react-redux'
import { timeRange, timeRangeBrief, timeRangeFull } from '../util/text'
import { changeEventResponse } from '../actions'
import A from './A'
import Avatar from './Avatar'
import Select from './Select'
import Icon from './Icon'
import LinkedPersonSentence from './LinkedPersonSentence'
import { ClickCatchingSpan } from './ClickCatcher'
import { get, find, isEmpty, sortBy } from 'lodash'
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
    <Attendance post={post} showButton={true} limit={7} alignRight={true}/>
  </div>
}

const Attendance = ({ post, limit, showButton, children }, { currentUser, dispatch }) => {
  const { responders } = post

  const going = sortBy(
    responders.filter(r => r.response === 'yes'),
    p => same('id', p, currentUser) ? 'Aaa' : p.name
  ).slice(0, limit)

  return <div className='attendance'>
    <div className='going'>
      {going.map(person => <Avatar person={person} key={person.id}/>)}
    </div>
    {currentUser && showButton && <RSVPSelect post={post}/>}
    {!isEmpty(going) && <LinkedPersonSentence people={going} className='blurb meta'>
      are going.
    </LinkedPersonSentence>}
    {children}
  </div>
}
Attendance.contextTypes = {currentUser: object, dispatch: func}

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
    const image = imageUrl(post, false)

    return <div className='post event'>
      <Header communities={communities}/>
      <p className='title post-section'>{title}</p>
      <p className='hashtag'>#hashtagTBD</p>

      <div className='event-details'>
        {image && <div className='image'>
          <img src={image}/>
        </div>}
        <Attendance post={post} limit={5} showButton={true}/>
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
