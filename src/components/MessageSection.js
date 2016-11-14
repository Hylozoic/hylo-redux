import React from 'react'
import { throttle, isEmpty, sortBy } from 'lodash'
const { array, bool, func, object } = React.PropTypes
import cx from 'classnames'
import Message from './Message'
import { position } from '../util/scrolling'
import { findDOMNode } from 'react-dom'
import { updatePostReadTime } from '../actions/posts'

export default class MessageSection extends React.Component {
  static propTypes = {
    messages: array,
    onScrollToTop: func,
    pending: bool,
    thread: object
  }

  static contextTypes = {
    currentUser: object,
    dispatch: func
  }

  constructor (props) {
    super(props)
    this.state = {
      scrolledUp: false
    }
  }

  componentDidMount () {
    this.scrollToBottom()
  }

  componentDidUpdate (prevProps) {
    const messagesLength = this.props.messages.length
    const oldMessagesLength = prevProps.messages.length
    const { scrolledUp } = this.state
    if (!scrolledUp && messagesLength !== oldMessagesLength) this.scrollToBottom()
  }

  scrollToMessage (id) {
    const message = findDOMNode(this['message' + id])
    const messageTop = position(message, this.list).y -
      document.querySelector('.thread .header').offsetHeight -
      document.getElementById('topNav').offsetHeight - 40
    this.list.scrollTop = messageTop
  }

  handleScroll = throttle(target => {
    const { scrolledUp } = this.state
    const { scrollTop, scrollHeight, offsetHeight } = target
    const onBottom = scrollTop > scrollHeight - offsetHeight
    if (!onBottom && !scrolledUp) this.setState({ scrolledUp: true })
    else if (onBottom && scrolledUp) {
      this.setState({ scrolledUp: false })
      this.markAsRead()
    }
    if (scrollTop <= 20 && this.props.onScrollToTop) this.props.onScrollToTop()
  }, 500, {trailing: true})

  scrollToBottom = () => {
    this.list.scrollTop = this.list.scrollHeight
    this.markAsRead()
  }

  markAsRead () {
    const { thread } = this.props
    const { dispatch } = this.context
    dispatch(updatePostReadTime(thread.id))
  }

  render () {
    const { thread } = this.props
    const messages = sortBy(this.props.messages || [], 'created_at')
    const { currentUser } = this.context
    const { scrolledUp } = this.state

    const latestMessage = messages.length && messages[messages.length - 1]
    const latestFromOther = latestMessage && latestMessage.user_id !== currentUser.id
    const newFromOther = latestFromOther && thread.last_read_at && new Date(latestMessage.created_at) > new Date(thread.last_read_at)

    return <div className={cx('messages-section', {empty: isEmpty(messages)})}
      ref={list => this.list = list}
      onScroll={e => this.handleScroll(e.target)}>
      {this.props.pending && <div className='message'>Loading...</div>}
      {messages.map(m =>
        <Message ref={node => this['message' + m.id] = node} message={m} key={m.id}/>)}
      {newFromOther && scrolledUp && <div className='newMessagesNotify' onClick={this.scrollToBottom}>New Messages</div>}
    </div>
  }
}
