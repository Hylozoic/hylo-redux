import React from 'react'
import { isEmpty, sortBy, values } from 'lodash'
const { array, bool, func, object } = React.PropTypes
import cx from 'classnames'
import CommentForm from './CommentForm'
import PeopleTyping from './PeopleTyping'
import Comment from './Comment'
import { appendComment } from '../actions/comments'
import { getSocket, socketUrl } from '../client/websockets'

export default class CommentSection extends React.Component {
  static propTypes = {
    comments: array,
    onExpand: func,
    post: object,
    expanded: bool
  }

  static contextTypes = {
    community: object,
    currentUser: object,
    isProjectRequest: bool,
    dispatch: func
  }

  constructor (props) {
    super(props)
    this.state = {
      peopleTyping: {}
    }
  }

  componentDidMount () {
    const { post: { id }, expanded } = this.props
    const { dispatch } = this.context
    if (expanded) {
      this.socket = getSocket()
      this.socket.post(socketUrl(`/noo/post/${id}/subscribe`))
      this.socket.on('commentAdded', c => dispatch(appendComment(id, c)))
      this.socket.on('userTyping', this.userTyping)
    }
  }

  componentWillUnmount () {
    const { post: { id }, expanded } = this.props
    if (expanded && this.socket) {
      this.socket.post(socketUrl(`/noo/post/${id}/unsubscribe`))
      this.socket.off('commentAdded')
      this.socket.off('userTyping')
    }
  }

  userTyping = data => {
    let newState = this.state
    if (data.isTyping) {
      newState.peopleTyping[data.userId] = data.userName
    } else {
      delete newState.peopleTyping[data.userId]
    }
    this.setState(newState)
  }

  startedTyping = () => {
    const { post: { id } } = this.props
    if (!this.socket) this.socket = getSocket()
    this.socket.post(socketUrl(`/noo/post/${id}/typing`), {isTyping: true})
  }

  stoppedTyping = () => {
    const { post: { id } } = this.props
    if (!this.socket) this.socket = getSocket()
    this.socket.post(socketUrl(`/noo/post/${id}/typing`), {isTyping: false})
  }

  render () {
    let { post, comments, onExpand, expanded } = this.props
    const truncate = !expanded
    const { currentUser, community, isProjectRequest } = this.context
    const placeholder = isProjectRequest ? 'How can you help?' : null
    const peopleTyping = values(this.state.peopleTyping)

    if (!comments) comments = []
    comments = sortBy(comments, c => c.created_at)
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
        key={c.id}/>)}
      {peopleTyping.length > 0 && <PeopleTyping names={peopleTyping} showNames={false}/>}
      {currentUser && <CommentForm startedTyping={this.startedTyping}
        stoppedTyping={this.stoppedTyping}
        postId={post.id}
        {...{placeholder}}/>}
    </div>
  }
}
