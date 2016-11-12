import React from 'react'
import { throttle, isEmpty, sortBy } from 'lodash'
const { array, bool, func, object } = React.PropTypes
import cx from 'classnames'
import Message from './Message'
import { position } from '../util/scrolling'
import { findDOMNode } from 'react-dom'

export default class MessageSection extends React.Component {
  static propTypes = {
    messages: array,
    onScrollToTop: func,
    pending: bool
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

  scrollToMessage (id) {
    const message = findDOMNode(this['message' + id])
    const messageTop = position(message, this.list).y -
      document.querySelector('.thread .header').offsetHeight -
      document.getElementById('topNav').offsetHeight - 40
    this.list.scrollTop = messageTop
  }

  _handleScroll = throttle(target => {
    const { scrolledUp } = this.state
    const { scrollTop, scrollHeight, offsetHeight } = target
    const onBottom = scrollTop > scrollHeight - offsetHeight
    if (!onBottom && !scrolledUp) this.setState({scrolledUp: true})
    else if (onBottom && scrolledUp) this.setState({scrolledUp: false})

    if (scrollTop <= 20 && this.props.onScrollToTop) this.props.onScrollToTop()
  }, 500, {trailing: true})

  _scrollToBottom () {
    this.list.scrollTop = this.list.scrollHeight
  }

  render () {
    const messages = sortBy(this.props.messages || [], 'created_at')

    return <div className={cx('messages-section', {empty: isEmpty(messages)})}
      ref={list => this.list = list}
      onScroll={e => this._handleScroll(e.target)}>
      {this.props.pending && <div className='message'>Loading...</div>}
      {messages.map(m =>
        <Message ref={node => this['message' + m.id] = node} message={m} key={m.id}/>)}
    </div>
  }
}
