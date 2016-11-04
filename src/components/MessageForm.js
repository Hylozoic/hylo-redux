import React from 'react'
import { get, throttle } from 'lodash'
import { connect } from 'react-redux'
import { createComment, updateCommentEditor } from '../actions/comments'
import { ADDED_COMMENT, trackEvent } from '../util/analytics'
import { textLength } from '../util/text'
import { onEnterNoShift } from '../util/textInput'
import { getSocket, socketUrl } from '../client/websockets'
var { func, object, string } = React.PropTypes

@connect((state, { postId }) => {
  return ({
    currentUser: get(state, 'people.current'),
    text: state.commentEdits.new[postId]
  })
}, null, null, {withRef: true})
export default class MessageForm extends React.Component {
  static propTypes = {
    currentUser: object,
    dispatch: func,
    postId: string,
    placeholder: string,
    text: string
  }

  submit = event => {
    const { dispatch, postId, text } = this.props
    if (event) event.preventDefault()
    const cleanText = text.replace(/<p>&nbsp;<\/p>$/m, '')
    if (!cleanText || textLength(cleanText) < 2) return false

    dispatch(createComment(postId, cleanText))
    .then(({ error }) => {
      if (error) return
      dispatch(updateCommentEditor(postId, '', true))
      trackEvent(ADDED_COMMENT, {post: {id: postId}})
    })

    return false
  }

  componentDidMount () {
    this.socket = getSocket()
  }

  focus () {
    this.refs.editor.focus()
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
    const { dispatch, postId, text } = this.props
    const updateStore = text => dispatch(updateCommentEditor(postId, text, true))

    const setText = event => updateStore(event.target.value)
    const placeholder = this.props.placeholder || 'Type a message...'

    const handleKeyDown = e => {
      this.startTyping()
      onEnterNoShift(e => {
        this.startTyping.cancel()
        this.sendIsTyping(false)
        e.preventDefault()
        this.submit()
        updateStore('')
      }, e)
    }

    return <form onSubmit={this.submit} className='message-form'>
      <textarea ref='editor' name='message' value={text}
        placeholder={placeholder}
        onChange={setText}
        onKeyUp={this.stopTyping}
        onKeyDown={handleKeyDown}/>
    </form>
  }
}
