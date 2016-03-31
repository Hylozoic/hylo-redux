import React from 'react'
import { filter, find, first, get, includes, isEmpty, map, pick, some, sortBy, without } from 'lodash'
const { array, bool, func, object } = React.PropTypes
import cx from 'classnames'
import {
  humanDate,
  nonbreaking,
  present,
  sanitize,
  timeRange,
  timeRangeFull,
  textLength,
  appendInP
} from '../util/text'
import truncate from 'html-truncate'
import A from './A'
import Avatar from './Avatar'
import Dropdown from './Dropdown'
import { ClickCatchingSpan } from './ClickCatcher'
import Comment from './Comment'
import CommentForm from './CommentForm'
import RSVPControl from './RSVPControl'
import PersonDropdownItem from './PersonDropdownItem'
import { scrollToAnchor } from '../util/scrolling'
import { connect } from 'react-redux'
import { compose } from 'redux'
import {
  changeEventResponse,
  fetchComments,
  followPost,
  notify,
  removePost,
  startPostEdit,
  voteOnPost
} from '../actions'
import { same } from '../models'
import decode from 'ent/decode'

const spacer = <span>&nbsp; •&nbsp; </span>

class Post extends React.Component {
  static propTypes = {
    post: object,
    communities: array,
    comments: array,
    commentsLoaded: bool,
    dispatch: func,
    commentingDisabled: bool,
    currentUser: object,
    expanded: bool,
    onExpand: func
  }

  static childContextTypes = {
    currentUser: object,
    dispatch: func,
    post: object
  }

  getChildContext () {
    return pick(this.props, 'currentUser', 'dispatch', 'post')
  }

  render () {
    const { post, communities, comments, commentingDisabled, expanded, onExpand } = this.props
    const { tag, media } = post
    const image = find(media, m => m.type === 'image')
    const classes = cx('post', tag, {image, expanded})
    const title = decode(post.name || '')
    const tagLabel = `#${post.tag === 'chat' ? 'all-topics' : post.tag}`

    return <div className={classes}>
      <Header communities={communities}/>
      <p className='title post-section'>{title}</p>
      {tag === 'event' && <EventSection/>}
      {post.location && <Location/>}
      {image && <img src={image.url} className='post-section full-image'/>}
      <Details {...{expanded, onExpand, tagLabel}}/>
      {tag === 'event' && <EventRSVP/>}
      <div className='voting post-section'><VoteButton/><Voters/></div>
      <Attachments/>
      <CommentSection truncate={!expanded} expand={onExpand}
        {...{comments, commentingDisabled}}/>
    </div>
  }
}

export default compose(
  connect((state, { post }) => {
    const { comments, commentsByPost, people } = state
    const commentIds = get(commentsByPost, post.id)
    const communities = get(post.communities, '0.id')
      ? post.communities
      : map(post.communities, id => find(state.communities, same('id', {id})))

    return {
      commentsLoaded: !!commentIds,
      comments: map(commentIds, id => comments[id]),
      currentUser: get(people, 'current'),
      communities
    }
  })
)(Post)

export const UndecoratedPost = Post // for testing

const Header = ({ communities }, { post, community }) => {
  const { tag } = post
  const person = tag === 'welcome' ? post.relatedUsers[0] : post.user
  const createdAt = new Date(post.created_at)
  if (!community) community = communities[0]

  return <div className='header'>
    <PostMenu/>
    <Avatar person={person}/>
    {tag === 'welcome'
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
}
Header.contextTypes = {post: object, community: object}

const Details = ({ expanded, onExpand, tagLabel }, { post }) => {
  let description = present(sanitize(post.description))
  const truncated = !expanded && textLength(description) > 200
  if (truncated) description = truncate(description, 200)
  if (description !== '<p></p>') description = appendInP(description, '&nbsp;')

  return <div className='post-section details'>
    <ClickCatchingSpan dangerouslySetInnerHTML={{__html: description}}/>
    {truncated && <span>
      <a onClick={onExpand}>Show&nbsp;more</a>
      &nbsp;
    </span>}
    <a className='hashtag'>{tagLabel}</a>
  </div>
}
Details.contextTypes = {post: object}

const EventSection = (props, { post }) => {
  const start = new Date(post.start_time)
  const end = post.end_time && new Date(post.end_time)
  const eventTime = timeRange(start, end)
  const eventTimeFull = timeRangeFull(start, end)

  return <p title={eventTimeFull} className='post-section event-time'>
    <i className='glyphicon glyphicon-time'></i>
    {eventTime}
  </p>
}
EventSection.contextTypes = {post: object}

const Location = (props, { post }) => {
  return <p title='location' className='post-section post-location'>
    <i className='glyphicon glyphicon-map-marker'></i>
    {post.location}
  </p>
}
Location.contextTypes = {post: object}

const Attachments = (props, { post }) => {
  const attachments = filter(post.media, m => m.type !== 'image')
  if (isEmpty(attachments)) return <span/>

  return <div className='post-section'>
    {attachments.map((file, i) =>
      <a key={i} className='attachment' href={file.url} target='_blank' title={file.name}>
        <img src={file.thumbnail_url}/>
        {truncate(file.name, 40)}
      </a>)}
  </div>
}
Attachments.contextTypes = {post: object}

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
PostMenu.contextTypes = Post.childContextTypes

class CommentSection extends React.Component {
  static propTypes = {
    comments: array,
    commentingDisabled: bool,
    truncate: bool,
    expand: func,
    dispatch: func
  }

  static contextTypes = {post: object, dispatch: func}

  render () {
    let { comments, commentingDisabled, truncate, expand } = this.props
    const { dispatch, post } = this.context
    if (!comments) comments = []
    comments = sortBy(comments, c => c.created_at)
    if (truncate) comments = comments.slice(-3)

    const expandComment = id => {
      expand()

      // the offset below is ignored by the backend, but it causes the frontend
      // to ignore the 3 comments that are already cached
      dispatch(fetchComments(post.id, {offset: 3}))
      .then(({ error }) => {
        if (error) {
          return dispatch(notify('Could not load comments. Please try again soon.', {type: 'error'}))
        }
        if (id) scrollToAnchor(`comment-${id}`, 15)
      })
    }

    return <div className={cx('comments-section post-section', {empty: isEmpty(comments)})}>
      <a name={`post-${post.id}-comments`}></a>
      {truncate && post.numComments > comments.length && <div className='comment show-all'>
        <a onClick={() => expandComment()}>Show all {post.numComments} comments</a>
      </div>}
      {comments.map(c => <Comment comment={{...c, post_id: post.id}}
        truncate={truncate}
        expand={() => expandComment(c.id)}
        key={c.id}/>)}
      {!commentingDisabled && <CommentForm postId={post.id}/>}
    </div>
  }
}

const EventRSVP = (props, { post, currentUser, dispatch }) => {
  const { responders } = post
  let isCurrentUser = r => r.id === get(currentUser, 'id')
  let currentResponse = get(find(responders, isCurrentUser), 'response') || ''
  let onPickResponse = currentUser &&
    (choice => dispatch(changeEventResponse(post.id, choice, currentUser)))

  return <RSVPControl {...{responders, currentResponse, onPickResponse}}/>
}
EventRSVP.contextTypes = Post.childContextTypes

export const VoteButton = (props, { post, currentUser, dispatch }) => {
  let vote = () => dispatch(voteOnPost(post, currentUser))
  let myVote = includes(map(post.voters, 'id'), (currentUser || {}).id)
  return <a className='vote-button' onClick={vote}>
    <i className={`icon-heart-new${myVote ? '-selected' : ''}`}></i>
    {myVote ? 'Liked' : 'Like'}
  </a>
}
VoteButton.contextTypes = Post.childContextTypes

export const Voters = (props, { post, currentUser }) => {
  let { voters } = post
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
    return <div className='voters meta'>
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
    </div>
  } else {
    return <span />
  }
}
Voters.contextTypes = {post: object, currentUser: object}
