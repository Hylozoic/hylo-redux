import React from 'react'
import { throttle, isEmpty, sortBy, values } from 'lodash'
const { array, bool, string, func, object } = React.PropTypes
import cx from 'classnames'
import Message from './Message'
import { appendComment } from '../actions/comments'
import { updatePostReadTime } from '../actions/posts'
import { getSocket, socketUrl } from '../client/websockets'

export default class MessageSection extends React.Component {
  static propTypes = {
    messages: array,
    thread: object
  }

  static contextTypes = {
    currentUser: object,
    dispatch: func
  }

  constructor(props) {
    super(props)
    this.state = {
      scrolledUp: false
    }
  }

  componentDidMount() {
    this._scrollToBottom()
  }

  componentDidUpdate(prevProps) {
    const messagesLength = this.props.messages.length
    const oldMessagesLength = prevProps.messages.length
    const { scrolledUp } = this.state
    if (!scrolledUp && messagesLength !== oldMessagesLength) this._scrollToBottom()
  }

  _handleScroll(target) {
    const { scrolledUp } = this.state
    const onBottom = target.scrollTop > target.scrollHeight - target.offsetHeight
    if (!onBottom && !scrolledUp) this.setState({ scrolledUp: true })
    else if (onBottom && scrolledUp) {
      this.setState({ scrolledUp: false })
      this.markAsRead()
    }
  }

  _scrollToBottom() {
    const div = this.refs['messageList']
    div.scrollTop = div.scrollHeight
    this.markAsRead()
  }

  markAsRead() {
    const { thread } = this.props
    const { dispatch } = this.context
    dispatch(updatePostReadTime(thread.id))
  }

  render() {
    let { messages, thread } = this.props
    const { currentUser } = this.context
    const { scrolledUp } = this.state
    const throttledScroll = throttle(this._handleScroll.bind(this), 500, { trailing: true })
    const onScroll = (event) => {
      // must be done this way because of event pooling https://fb.me/react-event-pooling
      const { target } = event
      throttledScroll(target)
    }

    if (!messages) messages = []
    messages = sortBy(messages, m => m.created_at)
    const latestMessage = messages.length && messages[messages.length - 1]
    const latestFromOther = latestMessage && latestMessage.user_id !== currentUser.id
    const newFromOther = latestFromOther && thread.last_read_at && new Date(latestMessage.created_at) > new Date(thread.last_read_at)

    return <div
             className={cx('messages-section', {empty: isEmpty(messages)})}
             ref='messageList'
             onScroll={onScroll}>
      {messages.map(m => <Message message={m} key={m.id}/>)}
      { newFromOther && scrolledUp && <div className='newMessagesNotify' onClick={this._scrollToBottom.bind(this)}>New Messages</div> }
    </div>
  }
}
