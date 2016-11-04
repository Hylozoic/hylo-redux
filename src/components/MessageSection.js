import React from 'react'
import { throttle, isEmpty, sortBy } from 'lodash'
const { array, func, object } = React.PropTypes
import cx from 'classnames'
import Message from './Message'

export default class MessageSection extends React.Component {
  static propTypes = {
    messages: array
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
    this._scrollToBottom()
  }

  componentDidUpdate () {
    const { scrolledUp } = this.state
    if (!scrolledUp) this._scrollToBottom()
  }

  _handleScroll (target) {
    const { scrolledUp } = this.state
    const onBottom = target.scrollTop > target.scrollHeight - target.offsetHeight
    if (!onBottom && !scrolledUp) this.setState({ scrolledUp: true })
    else if (onBottom && scrolledUp) this.setState({ scrolledUp: false })
  }

  _scrollToBottom () {
    const div = this.refs['messageList']
    div.scrollTop = div.scrollHeight
  }

  render () {
    let { messages } = this.props
    const throttledScroll = throttle(this._handleScroll.bind(this), 500, { trailing: true })
    const onScroll = (event) => {
      // must be done this way because of event pooling https://fb.me/react-event-pooling
      const { target } = event
      throttledScroll(target)
    }

    if (!messages) messages = []
    messages = sortBy(messages, m => m.created_at)

    return <div className={cx('messages-section', {empty: isEmpty(messages)})}
     ref='messageList'
     onScroll={onScroll}>
      {messages.map(m => <Message message={m} key={m.id}/>)}
    </div>
  }
}
