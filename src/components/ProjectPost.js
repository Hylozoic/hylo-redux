/* eslint-disable camelcase */
import React from 'react'
import { connect } from 'react-redux'
import Post, { Header, presentDescription } from './Post'
import CommentSection from './CommentSection'
import decode from 'ent/decode'
import { textLength, truncate } from '../util/text'
import { isEmpty } from 'lodash'
import { find, some, filter, map } from 'lodash/fp'
import { same } from '../models'
import { denormalizedPost, getComments, getPost, imageUrl } from '../models/post'
import { getCurrentCommunity } from '../models/community'
import { canCommentOnPost } from '../models/currentUser'
import Icon from './Icon'
import Video from './Video'
import LazyLoader from './LazyLoader'
import Avatar from './Avatar'
import LinkedPersonSentence from './LinkedPersonSentence'
import A from './A'
import { ClickCatchingSpan } from './ClickCatcher'
import { fetchPost, followPost, navigate } from '../actions'
import moment from 'moment'
const { array, bool, func, object } = React.PropTypes

const Deadline = ({ time }) => {
  const then = moment(time)
  const now = moment()
  const classes = ['deadline']
  if (then.diff(now, 'days') < 10) classes.push('soon')
  return <span className={classes.join(' ')} title={then.format('LLLL')}>
    {moment(time).toNow(true)} to go
  </span>
}

@connect((state, { post }) => ({
  children: map(id => denormalizedPost(getPost(id, state), state), post.children || [])
}))
export default class ProjectPost extends React.Component {
  static propTypes = {
    post: object,
    children: array
  }

  static contextTypes = {
    currentUser: object,
    community: object
  }

  render () {
    const { children, post, comments } = this.props
    const requests = filter(p => p.is_project_request, children)
    const { currentUser, community } = this.context
    const { communities, media, location, user } = post
    const title = decode(post.name || '')
    const video = find(m => m.type === 'video', media)
    const image = find(m => m.type === 'image', media)
    const canComment = canCommentOnPost(currentUser, post)
    const description = presentDescription(post, community)

    return <div className='post project boxy-post'>
      <Header post={post} communities={communities} />
      <p className='title post-section'>{title}</p>
      <div className='box'>
        {video
          ? <div className='video-wrapper'><Video url={video.url} /></div>
          : image && <div className='image'><img src={image.url} /></div>}
        <div className='row'>
          <div className='main-col'>
            {location && <div className='meta location'>
              <Icon name='Pin-1' />
              <span title={location}>{location}</span>
            </div>}
            {description && <div className='details'>
              <h3>Description</h3>
              <ClickCatchingSpan dangerouslySetInnerHTML={{__html: description}} />
            </div>}
            <div className='leads'>
              <h3>Project leads</h3>
              <Avatar person={user} />
              <div className='person-info'>
                <A className='name' to={`/u/${user.id}`}>{user.name}</A>
                <p>{user.bio}</p>
              </div>
            </div>
          </div>
          <Supporters post={post} />
        </div>
      </div>
      {requests.length > 0 && <div className='requests'>
        <h3>
          {requests.length} request{requests.length === 1 ? '' : 's'}&nbsp;
          <span className='soft'>to make this happen</span>
        </h3>
        {requests.map(request => {
          return <ProjectRequest key={request.id}
                                 post={request}
                                 parentPost={post}
                                 community={community} />
        })}
      </div>}
      <CommentSection {...{post, comments, canComment}} expanded />
    </div>
  }
}

const Supporters = ({ post, simple }, { currentUser, dispatch }) => {
  const { followers, ends_at } = post
  const isFollowing = some(same('id', currentUser), followers)
  const follow = () => dispatch(followPost(post.id, currentUser))

  return <div className='supporters'>
    {!simple && <div className='top'>
      <h3>
        {followers.length} supporter{followers.length === 1 ? '' : 's'}
      </h3>
      {ends_at && <Deadline time={ends_at} />}
    </div>}
    {!isEmpty(followers) && <LinkedPersonSentence people={followers} className='blurb meta'>
      support{followers.length > 1 || some(same('id', currentUser), followers) ? '' : 's'}
      <span>&nbsp;this.</span>
    </LinkedPersonSentence>}
    <div className='avatar-list'>
      {followers.map(person => <Avatar person={person} key={person.id} />)}
    </div>
    {!simple && <a className='support button has-icon' onClick={follow}>
      <Icon name={isFollowing ? 'ok-sign' : 'plus-sign'} glyphicon />
      {isFollowing ? 'Supporting' : 'Support this'}
    </a>}
  </div>
}
Supporters.contextTypes = {currentUser: object, dispatch: func}

class ProjectRequest extends React.Component {
  static propTypes = {
    post: object.isRequired,
    parentPost: object.isRequired,
    community: object
  }

  static contextTypes = {
    dispatch: func,
    isMobile: bool
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { dispatch, isMobile } = this.context
    const { post, parentPost, community } = this.props
    const { name, id, numComments } = post
    let description = presentDescription(post, community)
    const truncated = textLength(description) > 200
    if (truncated) {
      description = truncate(description, 200)
    }

    const zoom = () => {
      if (isMobile) {
        dispatch(navigate(`/p/${post.id}`))
      } else {
        this.setState({zoomed: true})
        dispatch(fetchPost(id))
      }
    }
    const unzoom = () => this.setState({zoomed: false})

    return <div className='nested-request'>
      {this.state.zoomed && <div className='zoomed'>
        <div className='backdrop' onClick={unzoom} />
        {post.user && <Post post={post} parentPost={parentPost} expanded />}
      </div>}
      <p className='title'>{name}</p>
      {description && <ClickCatchingSpan className='details'
        dangerouslySetInnerHTML={{__html: description}} />}
      {truncated && <span>
        <A to={`/p/${id}`} className='show-more'>Show&nbsp;more</A>
      </span>}
      <div className='meta'>
        <a className='help button has-icon' onClick={zoom}>
          <Icon name='plus-sign' glyphicon />
          Offer to help
        </a>
        {numComments > 0 && <a onClick={zoom}>
          {numComments} comment{numComments === 1 ? '' : 's'}
        </a>}
      </div>
    </div>
  }
}

const spacer = <span>&nbsp; •&nbsp; </span>

const UndecoratedProjectPostCard = ({ post, community, comments, isMobile, dispatch }, { currentUser }) => {
  const { name, user, ends_at, id } = post
  const url = `/p/${post.id}`
  const backgroundImage = `url(${imageUrl(post)})`
  const canComment = canCommentOnPost(currentUser, post)

  let description = presentDescription(post, community)
  const truncated = textLength(description) > 140
  if (truncated) description = truncate(description, 140)

  return <div className='post project-summary'>
    <LazyLoader className='image'>
      <A to={url} style={{backgroundImage}} />
    </LazyLoader>
    <div className='meta'>
      {ends_at && <span>
        <Deadline time={ends_at} />
        {spacer}
      </span>}
      <A to={`/u/${user.id}`}>{user.name}</A>
    </div>
    <A className='title' to={url}>{name}</A>
    {!isMobile && description && <div className='details-row'>
      <ClickCatchingSpan className='details'
        dangerouslySetInnerHTML={{__html: description}} />
      {truncated && <span>
        <A to={`/p/${id}`} className='show-more'>Show&nbsp;more</A>
      </span>}
    </div>}
    <Supporters post={post} simple />
    <div className='comments-section-spacer' />
    <CommentSection onExpand={() => dispatch(navigate(url))}
      isProjectRequest {...{post, canComment, comments}} />
  </div>
}
UndecoratedProjectPostCard.contextTypes = {currentUser: object}

export const ProjectPostCard = connect(
  (state, { post }) => ({
    post: denormalizedPost(post, state),
    comments: getComments(post, state),
    community: getCurrentCommunity(state),
    isMobile: state.isMobile
  })
)(UndecoratedProjectPostCard)
