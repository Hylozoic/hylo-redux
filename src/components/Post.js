import React from 'react'
import { Link } from 'react-router'
import { filter, find, isEmpty } from 'lodash'
const { array, bool, func, object } = React.PropTypes
import cx from 'classnames'
import { humanDate, present, sanitize, timeRange, timeRangeFull } from '../util/text'
import truncate from 'html-truncate'
import Avatar from './Avatar'
import Comment from './Comment'
import CommentForm from './CommentForm'
import { connect } from 'react-redux'
import { fetchComments, createComment } from '../actions'

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

@connect((state, props) => ({comments: state.commentsByPost[props.post.id]}))
export default class Post extends React.Component {
  static propTypes = {
    post: object,
    onExpand: func,
    expanded: bool,
    comments: array,
    dispatch: func
  }

  constructor (props) {
    super(props)
    this.state = {}
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

  render () {
    let { post, comments, expanded, dispatch } = this.props
    if (!comments) comments = []
    let image = find(post.media, m => m.type === 'image')
    var style = image ? {backgroundImage: `url(${image.url})`} : {}
    var classes = cx('post', post.type, {expanded: expanded, image: !!image})
    var description

    var title = post.name
    var person = post.user
    if (post.type === 'welcome') {
      person = post.relatedUsers[0]
      title = `${person.name} joined ${post.communities[0].name}. Welcome them!`
    }

    const now = new Date()
    const createdAt = new Date(post.created_at)
    const updatedAt = new Date(post.updated_at)
    const shouldShowUpdatedAt = (now - updatedAt) < (now - createdAt) * 0.8

    if (expanded) {
      description = present(sanitize(this.props.post.description))
      var attachments = filter(post.media, m => m.type !== 'image')
    }

    let isEvent = post.type === 'event'
    if (isEvent) {
      let start = new Date(post.start_time)
      let end = post.end_time && new Date(post.end_time)
      var eventTime = timeRange(start, end)
      var eventTimeFull = timeRangeFull(start, end)
    }

    return <div className={classes} onClick={this.expand}>
      <div className='header'>
        <Avatar person={person}/>
        <span className='name'>{person.name}</span>
        <div className='meta'>
          {humanDate(createdAt)}
          {shouldShowUpdatedAt && <span>
            {spacer}updated {humanDate(updatedAt)}
          </span>}
          {spacer}
          {post.votes} ♡
          {spacer}
          <a onClick={this.toggleComments} href='#'>
            {post.numComments} comment{post.numComments === 1 ? '' : 's'}
          </a>
        </div>
      </div>

      <p className='title'>{title}</p>

      {isEvent && <p title={eventTimeFull} className='event-time'>
        <i className='glyphicon glyphicon-time'></i>
        {eventTime}
      </p>}

      {image && <div className='image' style={style}></div>}

      {expanded && <div>
        {image && <img src={image.url} className='full-image post-section'/>}

        {description && <div className='details post-section'
          dangerouslySetInnerHTML={{__html: description}}/>}

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
            {post.communities.map(c => <li key={c.id} className='tag'>
              <Link to={`/c/${c.slug}`} key={c.id}>{c.name}</Link>
            </li>)}
          </ul>
        </div>

        {this.state.commentsExpanded && <div>
          {comments.map(c => <Comment comment={c} key={c.id}/>)}
          <CommentForm onCreate={text => dispatch(createComment(post.id, text))}/>
        </div>}
      </div>}
    </div>
  }
}
