/* eslint-disable camelcase */
import React from 'react'
import decode from 'ent/decode'
import { isEmpty, clone } from 'lodash'
import { find, some, filter } from 'lodash/fp'
import moment from 'moment'
import { textLength, truncate } from '../../util/text'
import { same } from '../../models'
import { canEditPost, canCommentOnPost } from '../../models/currentUser'
import Icon from '../Icon'
import Video from '../Video'
import Avatar from '../Avatar'
import LinkedPersonSentence from '../LinkedPersonSentence'
import { presentDescription } from '../PostDetails'
import Post from '../Post'
import PostHeader from '../PostHeader'
import RequestHeader from '../RequestHeader'
import CommentSection from '../CommentSection'
import A from '../A'
import ClickCatcher from '../ClickCatcher'

const { array, bool, string, func, object } = React.PropTypes

export default class ProjectPost extends React.Component {
  static propTypes = {
    post: object,
    fetchPost: func.isRequired,
    followPost: func.isRequired,
    navigate: func.isRequired,
    children: array
  }

  static contextTypes = {
    currentUser: object,
    community: object
  }

  render () {
    const { children, post, comments, fetchPost, followPost, navigate } = this.props
    const requests = filter(p => p.is_project_request, children)
    const { currentUser, community } = this.context
    const { communities, media, location, user } = post
    const title = decode(post.name || '')
    const video = find(m => m.type === 'video', media)
    const image = find(m => m.type === 'image', media)
    const canComment = canCommentOnPost(currentUser, post)
    const description = presentDescription(post, community)

    return <div className='post project boxy-post'>
      <PostHeader post={post} communities={communities} />
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
              <ClickCatcher dangerouslySetInnerHTML={{__html: description}} />
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
          <Supporters post={post} followPost={followPost} />
        </div>
      </div>
      {requests.length > 0 && <div className='requests'>
        <h3>
          {requests.length} request{requests.length === 1 ? '' : 's'}&nbsp;
          <span className='soft'>to make this happen</span>
        </h3>
        {requests.map(request => {
          return <ProjectRequest
            key={request.id}
            post={request}
            parentPost={post}
            community={community}
            navigate={navigate}
            fetchPost={fetchPost} />
        })}
      </div>}
      <CommentSection {...{post, comments, canComment}} expanded />
    </div>
  }
}

export class ProjectRequest extends React.Component {
  static propTypes = {
    post: object.isRequired,
    parentPost: object.isRequired,
    navigate: func.isRequired,
    fetchPost: func.isRequired,
    community: object
  }

  static contextTypes = {
    isMobile: bool,
    currentUser: object
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { currentUser, isMobile } = this.context
    const { post, parentPost, community, navigate, fetchPost } = this.props
    const { name, id, numComments, fulfilled_at, contributors } = post
    const canEdit = canEditPost(currentUser, parentPost)
    let description = presentDescription(post, community)
    const truncated = textLength(description) > 200
    if (truncated) {
      description = truncate(description, 200)
    }
    const listLength = contributors && contributors.length
    let contributorsList = ''
    if (listLength > 1) {
      const cloned = clone(contributors)
      const remaining = cloned.splice(0, listLength-1)[0]
      contributorsList = cloned.map(c => c.name).join(', ')
      contributorsList += ` and ${remaining.name}`
    }
    else if (listLength === 1) {
      contributorsList = contributors[0].name
    }

    const zoom = () => {
      if (isMobile) {
        navigate(`/p/${post.id}`)
      } else {
        this.setState({zoomed: true})
        fetchPost(id)
      }
    }
    const unzoom = () => this.setState({zoomed: false})

    return <div className='nested-request'>
      {this.state.zoomed && <div className='zoomed'>
        <div className='backdrop' onClick={unzoom} />
        {post.user && <Post post={post} parentPost={parentPost} expanded />}
      </div>}
      <p className='title'>{name}</p>
      {description && <ClickCatcher className='details'
        dangerouslySetInnerHTML={{__html: description}} />}
      {truncated && <span>
        <A to={`/p/${id}`} className='show-more'>Show&nbsp;more</A>
      </span>}
      <div className='meta'>
        {!fulfilled_at && <a className='help button has-icon' onClick={zoom}>
          <Icon name='plus-sign' glyphicon />
          Offer to help
        </a>}
        {fulfilled_at && <a className='button has-icon' onClick={zoom}>Add a comment</a>}
        {numComments > 0 && <a onClick={zoom}>
          {numComments} comment{numComments === 1 ? '' : 's'}
        </a>}
      </div>
      <RequestHeader post={post} canEdit={canEdit} invertedColor={true} />
    </div>
  }
}

export function Supporters ({ post, simple, followPost }, { currentUser }) {
  const { followers, ends_at } = post
  const isFollowing = some(same('id', currentUser), followers)
  const follow = () => followPost(post.id, currentUser)

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
Supporters.propTypes = {
  post: object.isRequired,
  simple: bool,
  followPost: func
}
Supporters.contextTypes = {currentUser: object}

export function Deadline ({ time }) {
  const then = moment(time)
  const now = moment()
  const classes = ['deadline']
  if (then.diff(now, 'days') < 10) classes.push('soon')
  return <span className={classes.join(' ')} title={then.format('LLLL')}>
    {moment(time).toNow(true)} to go
  </span>
}
Deadline.propTypes = {
  time: string.isRequired
}
