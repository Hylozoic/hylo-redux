import React from 'react'
import { Link } from 'react-router'
import { filter, find, isEmpty, findWhere, without } from 'lodash'
const { array, bool, func, object } = React.PropTypes
import cx from 'classnames'
import { humanDate, present, sanitize, timeRange, timeRangeFull } from '../util/text'
import truncate from 'html-truncate'
import A from './A'
import Avatar from './Avatar'
import Dropdown from './Dropdown'
import Comment from './Comment'
import CommentForm from './CommentForm'
import PostEditor from './PostEditor'
import { connect } from 'react-redux'
import { fetchComments, createComment, startPostEdit } from '../actions'

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

@connect(({ commentsByPost, people, postsInProgress, communities }, { post }) => ({
  comments: commentsByPost[post.id],
  currentUser: people.current,
  editing: !!postsInProgress[post.id],
  communities: post.communities.map(id => find(communities, c => c.id === id))
}))
export default class Post extends React.Component {
  static propTypes = {
    post: object,
    onExpand: func,
    expanded: bool,
    commentsExpanded: bool,
    communities: array,
    comments: array,
    dispatch: func,
    commentingDisabled: bool,
    currentUser: object,
    editing: bool
  }

  constructor (props) {
    super(props)
    this.state = {commentsExpanded: props.commentsExpanded}
  }

  expand = () => {
    let {expanded, onExpand, post} = this.props
    if (!expanded) onExpand(post.id)
  }

  toggleComments = event => {
    event.stopPropagation()
    event.preventDefault()
    this.expand()

    let { post, comments } = this.props
    if (!comments) this.props.dispatch(fetchComments(post.id))
    this.setState({commentsExpanded: !this.state.commentsExpanded})
  }

  edit = () => {
    let { dispatch, post } = this.props
    dispatch(startPostEdit(post))
  }

  render () {
    let { post, communities, expanded, currentUser, editing } = this.props
    if (editing) return this.renderEdit()

    let image = find(post.media, m => m.type === 'image')
    var style = image ? {backgroundImage: `url(${image.url})`} : {}
    var classes = cx('post', post.type, {expanded: expanded, image: !!image})

    var title = post.name
    var person = post.user
    if (post.type === 'welcome') {
      person = post.relatedUsers[0]
      title = `${person.name} joined ${communities[0].name}. Welcome them!`
    }

    const now = new Date()
    const createdAt = new Date(post.created_at)
    const updatedAt = new Date(post.updated_at)
    const shouldShowUpdatedAt = (now - updatedAt) < (now - createdAt) * 0.8

    let isEvent = post.type === 'event'
    if (isEvent) {
      let start = new Date(post.start_time)
      let end = post.end_time && new Date(post.end_time)
      var eventTime = timeRange(start, end)
      var eventTimeFull = timeRangeFull(start, end)
    }

    let canEdit = (currentUser && currentUser.id === person.id)

    return <div className={classes} onClick={this.expand}>
      <div className='header'>
        <Avatar person={person} />

        <Dropdown className='post-menu' alignRight={true} toggleChildren={
          <i className='icon-down'></i>
        }>
          {canEdit && <li><a onClick={this.edit}>Edit</a></li>}
          <li>
            <a onClick={() => window.alert('TODO')}>Report objectionable content</a>
          </li>
        </Dropdown>

        <span className='name'>{person.name}</span>
        <div className='meta'>
          <A to={`/p/${post.id}`}>{humanDate(createdAt)}</A>
          {shouldShowUpdatedAt && <span>
            {spacer}updated {humanDate(updatedAt)}
          </span>}
          {spacer}
          {post.votes} ♡
          {spacer}
          <a onClick={this.toggleComments} href='#'>
            {post.numComments} comment{post.numComments === 1 ? '' : 's'}
          </a>
          {post.public && <span>
            {spacer}Public
          </span>}
        </div>
      </div>

      <p className='title'>{title}</p>

      {isEvent && <p title={eventTimeFull} className='event-time'>
        <i className='glyphicon glyphicon-time'></i>
        {eventTime}
      </p>}

      {post.location && <p title='location' className='post-location'>
        <i className='glyphicon glyphicon-map-marker'></i>
        {post.location}
      </p>}

      {image && <div className='image' style={style}></div>}
      {expanded && <ExpandedPostDetails
        onCommentCreate={text => this.props.dispatch(createComment(post.id, text))}
        commentsExpanded={this.state.commentsExpanded}
        {...{image}} {...this.props}/>}
    </div>
  }

  renderEdit () {
    let { post } = this.props
    return <PostEditor post={post} expanded={true}/>
  }
}

const ExpandedPostDetails = props => {
  let {
    post, image, comments, commentsExpanded,
    commentingDisabled, onCommentCreate, communities, currentUser
  } = props
  let description = present(sanitize(post.description))
  let attachments = filter(post.media, m => m.type !== 'image')
  if (!comments) comments = []

  var eventYeses = filter(post.responders, er => er.response === 'yes')
  var eventMaybes = filter(post.responders, er => er.response === 'maybe')
  var eventNos = filter(post.responders, er => er.response === 'no')
  var userEventResponse = () => {
    var responder = filter(post.responders, responder => responder.id === currentUser.id)[0]
    if (responder) {
      return responder.response
    } else {
      return ''
    }
  }

  var eventResponse = userEventResponse()

  // copied straight from the angular app
  var rlResult = []
  var yesHeader = {header: 'Going', id: -1}
  var maybeHeader = {header: 'Maybe', id: -2}
  var noHeader = {header: 'Can\'t Go', id: -3}
  var getResponderList = () => {
    rlResult.length = 0

    var yeses = eventYeses
    var maybes = eventMaybes
    var nos = eventNos

    if (yeses.length > 0) {
      rlResult.push(yesHeader)
      rlResult = rlResult.concat(yeses)
    }
    if (maybes.length > 0) {
      rlResult.push(maybeHeader)
      rlResult = rlResult.concat(maybes)
    }
    if (nos.length > 0) {
      rlResult.push(noHeader)
      rlResult = rlResult.concat(nos)
    }
    return rlResult
  }
  var responderList = getResponderList()

  var changeEventResponse = function (response) {
    return e => {
      this.props.dispatch(changeEventResponse(post.id, response))
      /*
      var user = currentUser
      if (!user) return

      //Post.respond({id: post.id, response: response})

      var meInResponders = findWhere(post.responders, {id: user.id})
      post.responders = without(post.responders, meInResponders)

      console.log('cER - ', response)

      if (eventResponse === response) {
        console.log('cER - MATCH', response)
        eventResponse = ''
      } else {
        console.log('cER - MATCH', response)
        eventResponse = response
        post.responders.push({id: user.id, name: user.name, avatar_url: user.avatar_url, response: response})
      }
      */
    }
  }

  return <div>
    {image && <img src={image.url} className='full-image post-section'/>}

    {description && <div className='details post-section'
      dangerouslySetInnerHTML={{__html: description}}/>}

    {post.type === 'event' && <div className='rsvp-controls post-section'>
      <div className='btn-group buttons'>
        <button type='button' onClick={changeEventResponse('yes')} className={'rsvp-yes btn btn-default ' + (eventResponse === 'yes' ? 'active' : '')}>
          Going
          {eventYeses.length > 0
          ? ' ' + eventYeses.length
          : null}
        </button>
        <button type='button' className={'rsvp-maybe btn btn-default ' + (eventResponse === 'maybe' ? 'active' : '')}>
          Maybe
          {eventMaybes.length > 0
          ? ' (' + eventMaybes.length + ')'
          : null}
        </button>
        <button type='button' className={'rsvp-no btn btn-default ' + (eventResponse === 'no' ? 'active' : '')}>
          {"Can't Go"}
          {eventNos.length > 0
          ? ' ' + eventNos.length
          : null}
        </button>
      </div>

      {post.responders.length > 0 && <div className='responses'>

        <Dropdown className='responses-dropdown' toggleChildren='See Responses'>
          {responderList.map(personOrHeader => <li key={personOrHeader.id}>
            {personOrHeader.header
            ? <span className='header'>{personOrHeader.header}</span>
            : <span>
              <Avatar person={personOrHeader} /> <Link to={`/u/${personOrHeader.id}`}><span>{personOrHeader.name}</span></Link>
            </span>}
          </li>)}
        </Dropdown>
      </div>}
    </div>}

    {!isEmpty(attachments) && <div className='post-section'>
      {attachments.map((file, i) =>
        <a key={i} className='attachment' href={file.url} target='_blank' title={file.name}>
          <img src={file.thumbnail_url}/>
          {truncate(file.name, 30)}
        </a>)}
    </div>}

    <div className='meta'>
      <ul className='tags'>
        <li className={cx('tag', 'post-type', post.type)}>{post.type}</li>
        {communities.map(c => <li key={c.id} className='tag'>
          <Link to={`/c/${c.slug}`} key={c.id}>{c.name}</Link>
        </li>)}
      </ul>
    </div>

    {commentsExpanded && <div>
      {comments.map(c => <Comment comment={c} key={c.id}/>)}
      {!commentingDisabled && <CommentForm onCreate={onCommentCreate}/>}
    </div>}
  </div>
}
