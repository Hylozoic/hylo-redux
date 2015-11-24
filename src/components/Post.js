import React from 'react'
import { Link } from 'react-router'
import { filter, find, isEmpty } from 'lodash'
const { array, bool, func, object } = React.PropTypes
import cx from 'classnames'
import { humanDate, present, sanitize } from '../util/RichText'
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
    var user = post.user
    if (post.type === 'welcome') {
      user = post.relatedUsers[0]
      title = `${user.name} joined ${post.communities[0].name}. Welcome them!`
    }

    if (expanded) {
      description = present(sanitize(this.props.post.description))
      var now = new Date()
      var createdAt = new Date(post.created_at)
      var updatedAt = new Date(post.updated_at)
      var shouldShowUpdatedAt = (now - updatedAt) < (now - createdAt) * 0.8
      var attachments = filter(post.media, m => m.type !== 'image')
    }

    return <div className={classes} onClick={this.expand}>
      <Avatar user={user}/>

      <div className='content'>
        <strong className='name'>{post.user.name}</strong>
        <p className='title'>{title}</p>

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

          <div className='meta post-section'>
            {humanDate(createdAt)}
            {shouldShowUpdatedAt && <span>
              {spacer}updated {humanDate(updatedAt)}
            </span>}
            {spacer}
            <a onClick={this.toggleComments} href='#'>
              {post.numComments} comment{post.numComments === 1 ? '' : 's'}
            </a>
          </div>

          <div className='meta'>
            <div className={cx('tag', 'post-type', post.type)}>{post.type}</div>
            {post.communities.map(c => <Link to={`/c/${c.slug}`} className='tag community-tag' key={c.id}>
              {c.name}
            </Link>)}
          </div>

          {this.state.commentsExpanded && <div>
            {comments.map(c => <Comment comment={c} key={c.id}/>)}
            <CommentForm onCreate={text => dispatch(createComment(post.id, text))}/>
          </div>}
        </div>}

      </div>
    </div>
  }
}
