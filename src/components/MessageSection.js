import React from 'react'
import { throttle, isEmpty, maxBy } from 'lodash'
import { get } from 'lodash/fp'
const { array, bool, func, object } = React.PropTypes
import cx from 'classnames'
import Message from './Message'
import { position } from '../util/scrolling'
import { findDOMNode } from 'react-dom'
import { updatePostReadTime } from '../actions'

// the maximum amount of time in minutes that can pass between messages to still
// include them under the same avatar and timestamp
const MAX_MINS_TO_BATCH = 5

function createMessageList (messages, messageSection) {
  let currentHeader
  return messages.map((m, index) => {
    let headerDate, messageDate, diff, greaterThanMax
    let isHeader = false
    if (!currentHeader) {
      isHeader = true
      currentHeader = m
    } else {
      headerDate = new Date(currentHeader.created_at)
      messageDate = new Date(m.created_at)
      diff = Math.abs(headerDate - messageDate)
      greaterThanMax = Math.floor(diff / 60000) > MAX_MINS_TO_BATCH
      isHeader = greaterThanMax || m.user.id !== currentHeader.user.id
      currentHeader = isHeader ? m : currentHeader
    }
    return <Message message={m} key={m.id} isHeader={isHeader} />
  })
}

export default class MessageSection extends React.Component {
  static propTypes = {
    messages: array,
    onScroll: func,
    onScrollToTop: func,
    onHitBottom: func,
    onLeftBottom: func,
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
    this.visibility = require('visibility')()
    this.scrollToBottom()
  }

  componentDidUpdate (prevProps) {
    const messagesLength = this.props.messages.length
    const oldMessagesLength = prevProps.messages.length
    const { currentUser } = this.context
    const latestMessage = maxBy(this.props.messages || [], 'created_at')
    const userSentLatest = get('user_id', latestMessage) === currentUser.id
    const { scrolledUp } = this.state
    if (messagesLength !== oldMessagesLength && (!scrolledUp || userSentLatest)) this.scrollToBottom()
  }

  scrollToMessage (id) {
    const message = findDOMNode(this['message' + id])
    const messageTop = position(message, this.list).y -
      document.querySelector('#topNav').offsetHeight -
      document.querySelector('.thread .header').offsetHeight - 11
    this.list.scrollTop = messageTop
  }

  detectScrollExtremes = throttle(target => {
    const { onLeftBottom, onHitBottom } = this.props
    const { scrolledUp } = this.state
    const { scrollTop, scrollHeight, offsetHeight } = target
    const onBottom = scrollTop > scrollHeight - offsetHeight
    if (!onBottom && !scrolledUp) {
      this.setState({ scrolledUp: true })
      onLeftBottom()
    } else if (onBottom && scrolledUp) {
      this.setState({ scrolledUp: false })
      this.markAsRead()
      onHitBottom()
    }
    if (scrollTop <= 50 && this.props.onScrollToTop) this.props.onScrollToTop()
  }, 500, {trailing: true})

  handleScroll = event => {
    if (this.props.onScroll) this.props.onScroll(event)
    this.detectScrollExtremes(event.target)
  }

  scrollToBottom = () => {
    this.list.scrollTop = this.list.scrollHeight
    if (this.visibility.visible()) {
      this.markAsRead()
    } else {
      this.visibility.once('show', this.markAsRead)
    }
    this.props.onHitBottom()
  }

  markAsRead = () => {
    const { thread } = this.props
    const { dispatch } = this.context
    dispatch(updatePostReadTime(thread.id))
  }

  render () {
    const { messages } = this.props
    const messageList = createMessageList(messages, this)

    return <div className={cx('messages-section', {empty: isEmpty(messages)})}
      ref={list => { this.list = list }}
      onScroll={this.handleScroll}>
      <div className='messages-section-inner'>
        {messageList}
      </div>
    </div>
  }
}
