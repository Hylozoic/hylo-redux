import React from 'react'
import { get, debounce, throttle } from 'lodash'
import { connect } from 'react-redux'
import { CREATE_COMMENT } from '../actions'
import { createComment, updateCommentEditor } from '../actions/comments'
import { ADDED_COMMENT, trackEvent } from '../util/analytics'
import { textLength } from '../util/text'
import { onEnterNoShift } from '../util/textInput'
import AutosizingTextarea from './AutosizingTextarea'
import cx from 'classnames'
import { getSocket, socketUrl } from '../client/websockets'
var { array, bool, func, object, string } = React.PropTypes

// The interval between repeated typing notifications to the web socket. We send
// repeated notifications to make sure that a user gets notified even if they
// load a comment thread after someone else has already started typing.
const STARTED_TYPING_INTERVAL = 5000

// The time to wait for inactivity before announcing that typing has stopped.
const STOPPED_TYPING_WAIT_TIME = 8000

@connect((state, { postId }) => {
  return ({
    currentUser: get(state, 'people.current'),
    text: state.commentEdits.new[postId]
  })
})
export default class MessageForm extends React.Component {
  static propTypes = {
    currentUser: object,
    dispatch: func,
    postId: string,
    placeholder: string,
    text: string
  }

  static contextTypes = {
    isMobile: bool,
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

  render () {
    const {
      currentUser, dispatch, postId, text
    } = this.props
    const { isMobile } = this.context
    const updateStore = text => dispatch(updateCommentEditor(postId, text, true))

    const setText = event => updateStore(event.target.value)
    const placeholder = this.props.placeholder || 'Type a message...'

    const stoppedTyping = () => {
      if (this.socket) this.socket.post(socketUrl(`/noo/post/${postId}/typing`), { isTyping: false })
    }
    const startedTyping = () => {
      if (this.socket) this.socket.post(socketUrl(`/noo/post/${postId}/typing`), { isTyping: true })
    }

    const stopTyping = debounce(stoppedTyping, STOPPED_TYPING_WAIT_TIME)
    const startTyping = throttle(startedTyping, STARTED_TYPING_INTERVAL, {trailing: false})
    const handleKeyDown = e => {
      startTyping()
      onEnterNoShift(e => {
        stoppedTyping()
        e.preventDefault()
        this.submit()
        updateStore('')
      }, e)
    }

    return <form onSubmit={this.submit} className='message-form'>
            <textarea ref='editor' name='message'
              value={text}
              placeholder={placeholder}
              onChange={setText}
              onKeyUp={stopTyping}
              onKeyDown={handleKeyDown}/>
    </form>
  }
}

