import React from 'react'
import { throttle, isEmpty } from 'lodash'
import CommentImageButton from './CommentImageButton'
import { createComment } from '../actions'
import { SENT_MESSAGE, trackEvent } from '../util/analytics'
import { onEnterNoShift } from '../util/textInput'
import { getSocket, socketUrl } from '../client/websockets'
import cx from 'classnames'
var { func, object, string, bool } = React.PropTypes

export default class MessageForm extends React.Component {
  static propTypes = {
    postId: string,
    placeholder: string,
    text: string,
    onFocus: func,
    onBlur: func
  }

  static contextTypes = {
    isMobile: bool,
    currentUser: object,
    dispatch: func
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  submit = event => {
    if (event) event.preventDefault()
    if (!this.state.text) return false

    const { postId } = this.props
    const { currentUser } = this.context
    const userId = currentUser.id
    const { text } = this.state

    this.context.dispatch(createComment({postId, text, userId}))
    .then(({ error }) => {
      if (error) {
        this.setState({text})
      }
      else {
        trackEvent(SENT_MESSAGE)
      }
    })

    this.setState({text: ''})
    return false
  }

  componentDidMount () {
    this.socket = getSocket()
  }

  focus () {
    this.refs.editor.focus()
  }

  isFocused () {
    return this.refs.editor === document.activeElement
  }

  sendIsTyping (isTyping) {
    const { postId } = this.props
    if (this.socket) {
      this.socket.post(socketUrl(`/noo/post/${postId}/typing`), {isTyping})
    }
  }

  // broadcast "I'm typing!" every 5 seconds starting when the user is typing.
  // We send repeated notifications to make sure that a user gets notified even
  // if they load a comment thread after someone else has already started
  // typing.
  //
  // then, 8 seconds after typing stops, broadcast "I'm not typing!". if typing
  // resumes, cancel the 8-second countdown.
  startTyping = throttle(() => {
    this.sendIsTyping(true)
    if (this.queuedStop) clearTimeout(this.queuedStop)
    this.queuedStop = setTimeout(() => this.sendIsTyping(false), 8000)
  }, 5000)

  render () {
    const { onFocus, onBlur, postId } = this.props
    const placeholder = this.props.placeholder || 'Type a message...'
    const { isMobile } = this.context
    const { text } = this.state

    const handleKeyDown = e => {
      this.startTyping()
      onEnterNoShift(e => {
        this.startTyping.cancel()
        this.sendIsTyping(false)
        e.preventDefault()
        this.submit()
      }, e)
    }

    return <form onSubmit={this.submit} className='message-form'>
      <CommentImageButton postId={postId} />
      <textarea ref='editor' name='message' value={text}
        placeholder={placeholder}
        onFocus={onFocus}
        onChange={e => this.setState({text: e.target.value})}
        onBlur={onBlur}
        onKeyUp={this.stopTyping}
        onKeyDown={handleKeyDown} />
      {isMobile && <button onClick={isMobile ? this.submit : null}
        className={cx({enabled: !isEmpty(text)})}>Send</button>}
    </form>
  }
}
