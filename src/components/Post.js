import React from 'react'
import { filter, find, first, get, isEmpty, map, pick, some, without } from 'lodash'
const { array, bool, func, object } = React.PropTypes
import cx from 'classnames'
import { humanDate, nonbreaking, present, sanitize, timeRange, timeRangeFull, appendInP } from '../util/text'
import truncate from 'html-truncate'
import A from './A'
import Avatar from './Avatar'
import Dropdown from './Dropdown'
import ClickCatchingDiv from './ClickCatchingDiv'
import Comment from './Comment'
import CommentForm from './CommentForm'
import RSVPControl from './RSVPControl'
import PersonDropdownItem from './PersonDropdownItem'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { compose } from 'redux'
import {
  changeEventResponse,
  fetchComments,
  followPost,
  removePost,
  startPostEdit,
  voteOnPost
} from '../actions'
import { fetchPeople } from '../actions/fetchPeople'
import { same } from '../models'
import decode from 'ent/decode'

const spacer = <span>&nbsp; •&nbsp; </span>

class Post extends React.Component {
  static propTypes = {
    post: object,
    onExpand: func,
    communities: array,
    comments: array,
    commentsLoaded: bool,
    dispatch: func,
    commentingDisabled: bool,
    currentUser: object,
    voters: array
  }

  static contextTypes = {
    community: object
  }

  static childContextTypes = {
    currentUser: object,
    dispatch: func,
    post: object
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  getChildContext () {
    return pick(this.props, 'currentUser', 'dispatch', 'post')
  }

  componentDidMount () {
    // TODO this is a hack because prefetch isn't doing what I want yet
    // let { dispatch, post: {id} } = this.props
    // dispatch(fetchComments(id))
  }

  render () {
    let { post, communities, comments, commentingDisabled, voters } = this.props
    let community
    if (this.context.community) {
      community = this.context.community
    } else {
      community = communities[0]
    }

    let image = find(post.media, m => m.type === 'image')
    var classes = cx('post', post.type, 'expanded', {image: !!image})

    const createdAt = new Date(post.created_at)

    let title = decode(post.name || '')
    let person = post.type === 'welcome'
      ? post.relatedUsers[0]
      : post.user

    let isEvent = post.type === 'event'
    if (isEvent) {
      let start = new Date(post.start_time)
      let end = post.end_time && new Date(post.end_time)
      var eventTime = timeRange(start, end)
      var eventTimeFull = timeRangeFull(start, end)
    }

    return <div className={classes} onClick={this.expand}>
      <div className='header'>
        <PostMenu/>
        <Avatar person={person}/>
        {post.type === 'welcome'
          ? <WelcomePostHeader communities={communities}/>
          : <div>
              <A className='name' to={`/u/${person.id}`}>{person.name}</A>
              {spacer}
              <span className='meta'>
                <A to={`/p/${post.id}`}>{nonbreaking(humanDate(createdAt))}</A>
                &nbsp;in {community.name}
              </span>
            </div>}
      </div>

      <div className='post-section'><p className='title'>{title}</p></div>

      {isEvent && <p title={eventTimeFull} className='post-section event-time'>
        <i className='glyphicon glyphicon-time'></i>
        {eventTime}
      </p>}

      {post.location && <p title='location' className='post-section post-location'>
        <i className='glyphicon glyphicon-map-marker'></i>
        {post.location}
      </p>}

      <PostDetails
        {...{comments, communities, commentingDisabled, voters}}/>
    </div>
  }
}

export default compose(
  prefetch(({ dispatch, params: { id } }) => Promise.all([
    dispatch(fetchComments(id)),
    dispatch(fetchPeople({subject: 'voters', id}))
  ])),
  connect((state, { post }) => {
    let { comments, commentsByPost, people, peopleByQuery, communities } = state
    let commentIds = get(commentsByPost, post.id)
    return {
      commentsLoaded: !!commentIds,
      comments: map(commentIds, id => comments[id]),
      currentUser: get(people, 'current'),
      communities: map(post.communities, id => find(communities, same('id', {id}))),
      voters: map(get(peopleByQuery, `subject=voters&id=${post.id}`), id => people[id])
    }
  })
)(Post)

export const UndecoratedPost = Post // for testing

const WelcomePostHeader = ({ communities }, { post }) => {
  let person = post.relatedUsers[0]
  let community = communities[0]
  return <div>
    <strong><A to={`/u/${person.id}`}>{person.name}</A></strong> joined
    <span> </span>
    {community
      ? <span>
          <A to={`/c/${community.slug}`}>{community.name}</A>.
          <span> </span>
          <a className='open-comments'>
            Welcome them!
          </a>
        </span>
      : <span>
          a community that is no longer active.
        </span>}
  </div>
}

WelcomePostHeader.contextTypes = {post: object}

const PostMenu = (props, { dispatch, post, currentUser }) => {
  let canEdit = same('id', currentUser, post.user)
  let following = some(post.followers, same('id', currentUser))

  const edit = () => dispatch(startPostEdit(post))
  const remove = () => window.confirm('Are you sure? This cannot be undone.') &&
    dispatch(removePost(post.id))

  return <Dropdown className='post-menu' alignRight={true}
    toggleChildren={<i className='glyphicon glyphicon-option-horizontal'></i>}>
    {canEdit && <li><a onClick={edit}>Edit</a></li>}
    {canEdit && <li><a onClick={remove}>Remove</a></li>}
    <li>
      <a onClick={() => dispatch(followPost(post.id, currentUser))}>
        Turn {following ? 'off' : 'on'} notifications for this post
      </a>
    </li>
    <li>
      <a onClick={() => window.alert('TODO')}>Report objectionable content</a>
    </li>
  </Dropdown>
}

PostMenu.contextTypes = {dispatch: func, post: object, currentUser: object}

const PostDetails = (props, { post, currentUser, dispatch }) => {
  const { comments, commentingDisabled, voters } = props
  const image = find(post.media, m => m.type === 'image')
  const typeLabel = `#${post.type === 'chat' ? 'all-topics' : post.type}`
  const description = present(appendInP(
    sanitize(post.description), ` <a class='hashtag'>${typeLabel}</a>`))
  const attachments = filter(post.media, m => m.type !== 'image')

  return <div className='post-details'>
    {description && <ClickCatchingDiv className='details post-section'
      dangerouslySetInnerHTML={{__html: description}}/>}

    {image && <div className='post-section'>
       <img src={image.url} className='full-image'/>
     </div>}

    {post.type === 'event' && <EventRSVP postId={post.id} responders={post.responders}/>}
    <div className='voting post-section'>
      <VoteButton /><Voters voters={voters} />
    </div>

    {!isEmpty(attachments) && <div className='post-section'>
      {attachments.map((file, i) =>
        <a key={i} className='attachment' href={file.url} target='_blank' title={file.name}>
          <img src={file.thumbnail_url}/>
          {truncate(file.name, 40)}
        </a>)}
    </div>}

    <CommentSection
      {...{post, comments, commentingDisabled}}/>
  </div>
}

PostDetails.contextTypes = Post.childContextTypes

class CommentSection extends React.Component {
  static propTypes = {
    comments: array,
    commentingDisabled: bool
  }

  static contextTypes = {post: object}

  constructor (props) {
    super(props)
    this.state = {expanded: false}
  }

  toggleExpanded = () => {
    this.setState({expanded: !this.state.expanded})
  }

  render () {
    let { comments, commentingDisabled } = this.props
    let { post } = this.context
    let { expanded } = this.state
    if (!comments) comments = []
    let displayedComments = expanded ? comments : comments.slice(0, 3)
    return <div className={cx('comments-section', 'post-section', {'empty': isEmpty(comments)})}>
      <a name={`post-${post.id}-comments`}></a>
        {displayedComments.map(c =>
          <Comment comment={{...c, post_id: post.id}} key={c.id}/>)}
      {comments.length > 3 && !expanded && <div className='show-all'>
          <a onClick={this.toggleExpanded}>Show all</a>
        </div>}
      {!commentingDisabled && <CommentForm postId={post.id}/>}
    </div>
  }
}

const EventRSVP = ({ postId, responders }, { currentUser, dispatch }) => {
  let isCurrentUser = r => r.id === get(currentUser, 'id')
  let currentResponse = get(find(responders, isCurrentUser), 'response') || ''
  let onPickResponse = currentUser &&
    (choice => dispatch(changeEventResponse(postId, choice, currentUser)))

  return <RSVPControl {...{responders, currentResponse, onPickResponse}}/>
}

EventRSVP.contextTypes = {currentUser: object, dispatch: func}

export const VoteButton = (props, { post, dispatch }) => {
  let vote = () => dispatch(voteOnPost(post))
  return <a className='vote-button' onClick={vote}>
    <i className={`icon-heart-new${post.myVote ? '-selected' : ''}`}></i>
    {post.myVote ? 'Liked' : 'Like'}
  </a>
}

VoteButton.contextTypes = {post: object, dispatch: func}

export const Voters = ({ voters }, { post, currentUser }) => {
  if (!voters) voters = []

  let onlyAuthorIsVoting = voters.length === 1 && same('id', first(voters), post.user)
  let meInVoters = find(voters, same('id', currentUser))
  let otherVoters = meInVoters ? without(voters, meInVoters) : voters

  let numShown = 2
  let num = otherVoters.length
  let hasHidden = num > numShown
  let separator = threshold =>
    num > threshold
      ? ', '
      : num === threshold
        ? `${voters.length === 2 ? '' : ','} and `
        : ''

  if (voters.length > 0 && !onlyAuthorIsVoting) {
    return <span className='voters meta'>
      {meInVoters && <span className='voter'>You</span>}
      {meInVoters && separator(1)}
      {otherVoters.slice(0, numShown).map((person, index) =>
        <span className='voter' key={person.id}>
          <a href={`/u/${person.id}`}>{person.name}</a>
          {index !== numShown - 1 && separator(2)}
        </span>)}
      {hasHidden && ', and '}
      {hasHidden && <Dropdown className='inline'
        toggleChildren={<span>
          {num - numShown} other{num - numShown > 1 ? 's' : ''}
        </span>}>
        {otherVoters.slice(numShown).map(p =>
          <PersonDropdownItem key={p.id} person={p}/>)}
      </Dropdown>}
      &nbsp;liked this.
    </span>
  } else {
    return <span />
  }
}

Voters.contextTypes = {post: object, currentUser: object}
