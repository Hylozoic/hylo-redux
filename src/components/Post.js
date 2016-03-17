import React from 'react'
import { Link } from 'react-router'
import { filter, find, first, get, isEmpty, map, pick, some, without } from 'lodash'
import { projectUrl } from '../routes'
const { array, bool, func, object, string } = React.PropTypes
import cx from 'classnames'
import { humanDate, nonbreaking, present, sanitize, timeRange, timeRangeFull } from '../util/text'
import truncate from 'html-truncate'
import A from './A'
import Avatar from './Avatar'
import Dropdown from './Dropdown'
import ClickCatchingDiv from './ClickCatchingDiv'
import Comment from './Comment'
import CommentForm from './CommentForm'
import RSVPControl from './RSVPControl'
import SharingDropdown from './SharingDropdown'
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
    console.log('componentDidMount')
    let { dispatch, post: {id} } = this.props
    dispatch(fetchComments(id))
  }

  render () {
    let { post, communities, comments, commentingDisabled, voters } = this.props

    let image = find(post.media, m => m.type === 'image')
    var classes = cx('post', post.type, {expanded: true, image: !!image})

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
        <CaretMenu/>
        <Avatar person={person}/>
        {post.type === 'welcome'
          ? <WelcomePostHeader communities={communities}/>
          : <span>
              <A className='name' to={`/u/${person.id}`}>{person.name}</A>
            </span>}
        <PostMeta voters={voters}/>
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

      <PostDetails
        {...{comments, communities, commentingDisabled}}/>
    </div>
  }
}

export default compose(
  prefetch(({ dispatch, params, query }) => dispatch(fetchComments({id: 13624, log: console.log('prefetch!')}))),
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
  return <span>
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
  </span>
}

WelcomePostHeader.contextTypes = {post: object}

const CaretMenu = (props, { dispatch, post, currentUser }) => {
  let canEdit = same('id', currentUser, post.user)
  let following = some(post.followers, same('id', currentUser))

  const edit = () => dispatch(startPostEdit(post))
  const remove = () => window.confirm('Are you sure? This cannot be undone.') &&
    dispatch(removePost(post.id))

  return <Dropdown className='post-menu' alignRight={true}
    toggleChildren={<i className='icon-down'></i>}>
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

CaretMenu.contextTypes = {dispatch: func, post: object, currentUser: object}

const PostMeta = ({ voters }, { post, dispatch, postDisplayMode }) => {
  const now = new Date()
  const createdAt = new Date(post.created_at)
  const updatedAt = new Date(post.updated_at)
  const shouldShowUpdatedAt = (now - updatedAt) < (now - createdAt) * 0.8
  if (!voters) voters = []
  let project = postDisplayMode !== 'project' && get(post, 'projects.0')
  let vote = () => dispatch(voteOnPost(post))
  let fetchVoters = () => dispatch(fetchPeople({subject: 'voters', id: post.id}))

  return <div className='meta'>
    <A to={`/p/${post.id}`}>{nonbreaking(humanDate(createdAt))}</A>
    {project && <span>
      &nbsp;for <A to={projectUrl(project)}>"{truncate(project.title, 60)}"</A>
    </span>}
    {shouldShowUpdatedAt && <span>
      {spacer}updated&nbsp;{nonbreaking(humanDate(updatedAt))}
    </span>}
    {spacer}
    {post.votes === 0
      ? '0'
      : <Dropdown className='inline'
          onFirstOpen={fetchVoters}
          toggleChildren={<span>{post.votes}</span>}>
          {voters.map(p => <PersonDropdownItem key={p.id} person={p}/>)}
        </Dropdown>}
    <a onClick={vote} className='vote'>
      <i className={`icon-heart-new${post.myVote ? '-selected' : ''}`}></i>
    </a>
    {spacer}
    <a href='#'>
      {post.numComments}&nbsp;comment{post.numComments === 1 ? '' : 's'}
    </a>
    {post.public && <span>
      {spacer}Public
      {spacer}<SharingDropdown className='share-post' toggleChildren={<span>Share</span>} alignRight={true} url={`/p/${post.id}`} text={post.name} />
    </span>}
  </div>
}

PostMeta.contextTypes = {...Post.childContextTypes, postDisplayMode: string}

const PostDetails = (props, { post, currentUser, dispatch }) => {
  let { comments, commentingDisabled, communities } = props

  let image = find(post.media, m => m.type === 'image')
  let description = present(sanitize(post.description))
  let attachments = filter(post.media, m => m.type !== 'image')

  return <div className='post-details'>
    {image && <img src={image.url} className='full-image post-section'/>}

    {description && <ClickCatchingDiv className='details post-section'
      dangerouslySetInnerHTML={{__html: description}}/>}

    {post.type === 'event' && <EventRSVP postId={post.id} responders={post.responders}/>}
    <Followers post={post} currentUser={currentUser} />

    {!isEmpty(attachments) && <div className='post-section'>
      {attachments.map((file, i) =>
        <a key={i} className='attachment' href={file.url} target='_blank' title={file.name}>
          <img src={file.thumbnail_url}/>
          {truncate(file.name, 40)}
        </a>)}
    </div>}

    <PostTags post={post} communities={communities}/>

    <CommentSection
      {...{post, comments, commentingDisabled}}/>
  </div>
}

PostDetails.contextTypes = Post.childContextTypes

const PostTags = ({ post, communities }) =>
  <ul className='tags'>
    <li className={cx('tag', 'post-type', post.type)}>{post.type}</li>
    {(communities || []).map(c => <li key={c.id} className='tag'>
      <Link to={`/c/${c.slug}`}>{c.name}</Link>
    </li>)}
  </ul>

const CommentSection = (props, { post }) => {
  let { comments, commentingDisabled } = props
  if (!comments) comments = []
  return <div className='comments-section'>
    <a name={`post-${post.id}-comments`}></a>
      {comments.map(c =>
        <Comment comment={{...c, post_id: post.id}} key={c.id}/>)}
    {!commentingDisabled && <CommentForm postId={post.id}/>}
  </div>
}

CommentSection.contextTypes = {post: object}

const EventRSVP = ({ postId, responders }, { currentUser, dispatch }) => {
  let isCurrentUser = r => r.id === get(currentUser, 'id')
  let currentResponse = get(find(responders, isCurrentUser), 'response') || ''
  let onPickResponse = currentUser &&
    (choice => dispatch(changeEventResponse(postId, choice, currentUser)))

  return <RSVPControl {...{responders, currentResponse, onPickResponse}}/>
}

EventRSVP.contextTypes = {currentUser: object, dispatch: func}

export const Followers = (props, { post, currentUser }) => {
  let { followers, length } = post
  if (!followers) followers = []

  let onlyAuthorIsFollowing = length === 1 && same('id', first(followers), post.user)
  let meInFollowers = find(followers, same('id', currentUser))
  let otherFollowers = meInFollowers ? without(followers, meInFollowers) : followers

  let numShown = 2
  let num = otherFollowers.length
  let hasHidden = num > numShown
  let separator = threshold =>
    num > threshold
      ? ', '
      : num === threshold
        ? `${followers.length === 2 ? '' : ','} and `
        : ''

  if (followers.length > 0 && !onlyAuthorIsFollowing) {
    return <div className='meta followers'>
      {meInFollowers && <span>You{separator(1)}</span>}
      {otherFollowers.slice(0, numShown).map((person, index) =>
        <span key={person.id}>
          <a href={`/u/${person.id}`}>{person.name}</a>
          {index !== numShown - 1 && separator(2)}
        </span>)}
      {hasHidden && ', and '}
      {hasHidden && <Dropdown className='inline'
        toggleChildren={<span>
          {num - numShown} other{num - numShown > 1 ? 's' : ''}
        </span>}>
        {otherFollowers.slice(numShown).map(p =>
          <PersonDropdownItem key={p.id} person={p}/>)}
      </Dropdown>}
      &nbsp;{meInFollowers || num > 1 ? 'are' : 'is'} following this.

    </div>
  } else {
    return <span />
  }
}

Followers.contextTypes = {post: object, currentUser: object}
