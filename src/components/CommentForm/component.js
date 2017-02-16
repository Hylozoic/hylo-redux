import React from 'react'
import { debounce, throttle } from 'lodash'
import Avatar from '../Avatar'
import CommentImageButton from '../CommentImageButton'
import RichTextEditor from '../RichTextEditor'
import Icon from '../Icon'
import { ADDED_COMMENT, trackEvent } from '../../util/analytics'
import { textLength } from '../../util/text'
import { onCmdOrCtrlEnter } from '../../util/textInput'
import { responseMissingTagDescriptions } from '../../util/api'
import cx from 'classnames'
import { getSocket, socketUrl } from '../../client/websockets'
var { array, bool, func, object, string, shape } = React.PropTypes

export default class CommentForm extends React.PureComponent {
  static propTypes = {
    postId: string,
    actions: shape({
      showModal: func.isRequired,
      createComment: func.isRequired,
      updateComment: func.isRequired,
      updateCommentEditor: func.isRequired
    }),
    commentId: string,
    mentionOptions: array,
    placeholder: string,
    text: string,
    newComment: bool,
    close: func,
    pending: bool
  }

  static contextTypes = {
    isMobile: bool,
    currentUser: object.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {}
    if (typeof window !== 'undefined') {
      this.modifierKey = window.navigator.platform.startsWith('Mac')
      ? 'Cmd' : 'Ctrl'
    }

    this.id = Math.random().toString().slice(2, 7)
  }

  componentDidMount () {
    this.socket = getSocket()
  }

  submit = (event, newTagDescriptions) => {
    const {
      actions: { showModal, createComment, updateComment }, postId, commentId, newComment, close, pending
    } = this.props
    const { currentUser } = this.context
    const userId = currentUser.id
    if (event) event.preventDefault()
    if (!this.state.enabled || pending) return
    const text = this.refs.editor.getContent().replace(/<p>&nbsp;<\/p>$/m, '')
    if (!text || textLength(text) < 2) return false

    const tagDescriptions = newTagDescriptions || this.state.tagDescriptions

    const showTagEditor = () => showModal('tag-editor', {
      creating: false,
      saveParent: this.saveWithTagDescriptions
    })
    if (newComment) {
      createComment({postId, text, tagDescriptions, userId})
      .then(action => {
        if (responseMissingTagDescriptions(action)) return showTagEditor()
        if (action.error) return
        trackEvent(ADDED_COMMENT, {post: {id: postId}})
      })
    } else {
      updateComment(commentId, text, tagDescriptions)
      .then(action => responseMissingTagDescriptions(action) && showTagEditor())
      close()
    }

    return false
  }

  saveWithTagDescriptions = tagDescriptions => {
    this.setState({tagDescriptions})
    this.submit(null, tagDescriptions)
  }

  setText (text) {
    const { actions: { updateCommentEditor }, commentId, pending, postId, newComment } = this.props
    const storeId = newComment ? postId : commentId
    if (!pending) updateCommentEditor(storeId, text, newComment)
  }

  handleKeyDown = (e) => {
    const { postId, newComment } = this.props
    const startedTyping = () => {
      if (!newComment) return
      if (this.socket) this.socket.post(socketUrl(`/noo/post/${postId}/typing`), { isTyping: true })
    }
    const startTyping = throttle(startedTyping, STARTED_TYPING_INTERVAL, {trailing: false})
    this.setEnabled(this.refs.editor.getContent())
    startTyping()
    onCmdOrCtrlEnter(e => {
      this.stoppedTyping()
      e.preventDefault()
      this.submit()
    }, e)
  }

  stoppedTyping = () => {
    const { postId, newComment } = this.props
    if (!newComment) return
    if (this.socket) this.socket.post(socketUrl(`/noo/post/${postId}/typing`), { isTyping: false })
  }

  setEnabled = (text) => {
    this.setState({enabled: text.length > 0})
  }

  stopTyping = debounce(this.stoppedTyping, STOPPED_TYPING_WAIT_TIME)

  delaySetText = debounce(text => {
    this.setEnabled(text)
    this.setText(text)
  }, 50)

  cancel = () => {
    this.setText(undefined)
  }

  render () {
    const { text, close, pending, postId, newComment } = this.props
    const { currentUser, isMobile } = this.context
    const { enabled } = this.state
    const editing = text !== undefined
    const edit = () => this.setText('')
    const placeholder = this.props.placeholder || 'Add a comment...'

    return <form onSubmit={this.submit} className='comment-form'>
      <Avatar person={currentUser} />
      {editing
        ? <div className='content'>
          <RichTextEditor ref='editor' name='comment' startFocused
            content={text}
            onChange={ev => this.delaySetText(ev.target.value)}
            onKeyUp={this.stopTyping}
            onKeyDown={this.handleKeyDown} />

          <div className='right'>
            <a className='cancel' onClick={this.cancel}>
              <Icon name='Fail' />
            </a>
          </div>

          {newComment && <CommentImageButton postId={postId} />}
          <input type='submit' value='Post' ref='button'
            className={cx({enabled: enabled && !pending})} />
          {close && <button onClick={close}>Cancel</button>}
          {!isMobile && this.modifierKey && <span className='meta help-text'>
            or press {this.modifierKey}-Enter
          </span>}
        </div>
      : <div className='content placeholder' onClick={edit}>
        {placeholder}
      </div>}
    </form>
  }
}

// The interval between repeated typing notifications to the web socket. We send
// repeated notifications to make sure that a user gets notified even if they
// load a comment thread after someone else has already started typing.
const STARTED_TYPING_INTERVAL = 5000

// The time to wait for inactivity before announcing that typing has stopped.
const STOPPED_TYPING_WAIT_TIME = 8000
