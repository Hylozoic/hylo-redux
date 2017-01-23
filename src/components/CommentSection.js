/* eslint-disable camelcase */
import React from 'react'
import { isEmpty } from 'lodash'
import { sortBy } from 'lodash/fp'
const { array, bool, func, object } = React.PropTypes
import cx from 'classnames'
import CommentForm from './CommentForm'
import PeopleTyping from './PeopleTyping'
import Comment from './Comment'
import { appendComment } from '../actions/comments'
import { getSocket, socketUrl } from '../client/websockets'

export default class CommentSection extends React.Component {
  static propTypes = {
    post: object,
    comments: array,
    canComment: bool,
    onExpand: func,
    expanded: bool,
    isProjectRequest: bool
  }

  static contextTypes = {
    currentUser: object,
    community: object,
    dispatch: func
  }

  componentDidMount () {
    const { post, post: { id }, expanded } = this.props
    const { currentUser } = this.context
    const { dispatch } = this.context
    if (expanded) {
      this.socket = getSocket()
      this.socket.post(socketUrl(`/noo/post/${id}/subscribe`))
      this.socket.on('commentAdded', ({ parent_post_id, comment }) => {
        if (parent_post_id !== post.parent_post_id) return
        if (comment.user_id === currentUser.id) return
        dispatch(appendComment(id, comment))
      })
    }
  }

  componentWillUnmount () {
    const { post: { id }, expanded } = this.props
    if (expanded && this.socket) {
      this.socket.post(socketUrl(`/noo/post/${id}/unsubscribe`))
      this.socket.off('commentAdded')
    }
  }

  render () {
    const { post, canComment, onExpand, expanded, isProjectRequest } = this.props
    const truncate = !expanded
    const placeholder = isProjectRequest ? 'How can you help?' : null
    const community = this.context.community || post.communities[0]

    let { comments } = this.props
    if (!comments) comments = []
    comments = sortBy('created_at', comments)
    if (truncate) comments = comments.slice(-3)

    return <div className={cx('comments-section post-section', {empty: isEmpty(comments)})}>
      {truncate && post.numComments > comments.length && <div className='comment show-all'>
        <a onClick={() => onExpand()}>Show all {post.numComments} comments</a>
      </div>}
      {comments.map(c => <Comment comment={{...c, post_id: post.id}}
        truncate={truncate}
        expand={() => onExpand(c.id)}
        community={community}
        expanded={expanded}
        key={c.id} />)}
      <PeopleTyping showNames={false} />
      {canComment && <CommentForm postId={post.id} {...{placeholder}} />}
    </div>
  }
}
