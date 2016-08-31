import React from 'react'
import { get, debounce, throttle } from 'lodash'
import { connect } from 'react-redux'
import Avatar from './Avatar'
import RichTextEditor from './RichTextEditor'
import { createComment, updateCommentEditor, updateComment } from '../actions'
import { ADDED_COMMENT, trackEvent } from '../util/analytics'
import { textLength } from '../util/text'
import { onCmdOrCtrlEnter } from '../util/textInput'
import TagDescriptionEditor from './TagDescriptionEditor'
import cx from 'classnames'
var { array, bool, func, object, string } = React.PropTypes
const MAX_TYPING_INTERVAL = 3000
const STOPPED_TYPING_WAITTIME = 2000

@connect((state, { postId, commentId }) => {
  return ({
    currentUser: get(state, 'people.current'),
    editingTagDescriptions: state.editingTagDescriptions,
    text: postId ? state.commentEdits.new[postId] : state.commentEdits.edit[commentId],
    newComment: !commentId
  })
})
export default class CommentForm extends React.Component {
  static propTypes = {
    currentUser: object,
    dispatch: func,
    startedTyping: func,
    stoppedTyping: func,
    postId: string,
    commentId: string,
    mentionOptions: array,
    placeholder: string,
    editingTagDescriptions: bool,
    text: string,
    newComment: bool,
    close: func
  }

  static defaultProps = {
    startedTyping: function () {},
    stoppedTyping: function () {}
  }

  static contextTypes = {
    isMobile: bool
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  submit = event => {
    const { dispatch, postId, commentId, newComment, close } = this.props
    if (event) event.preventDefault()
    if (!this.state.enabled) return
    const text = this.refs.editor.getContent().replace(/<p>&nbsp;<\/p>$/m, '')
    if (!text || textLength(text) < 2) return false

    if (newComment) {
      dispatch(createComment(postId, text, this.state.tagDescriptions))
      .then(({ error }) => {
        if (error) return
        trackEvent(ADDED_COMMENT, {post: {id: postId}})
      })
    } else {
      dispatch(updateComment(commentId, text, this.state.tagDescriptions))
      close()
    }

    return false
  }

  saveWithTagDescriptions = tagDescriptions => {
    this.setState({tagDescriptions})
    this.submit()
  }

  componentDidMount () {
    const modifierKey = window.navigator.platform.startsWith('Mac')
      ? 'Cmd' : 'Ctrl'
    this.setState({modifierKey})
  }

  render () {
    const {
      currentUser, editingTagDescriptions, dispatch, postId, commentId, text,
      newComment, close, startedTyping, stoppedTyping
    } = this.props
    const { isMobile } = this.context
    const editing = text !== undefined
    const storeId = newComment ? postId : commentId
    const updateStore = text => dispatch(updateCommentEditor(storeId, text, newComment))
    const edit = () => updateStore('')

    const setText = event => updateStore(event.target.value)
    const placeholder = this.props.placeholder || 'Add a comment...'

    const keyUp = debounce(stoppedTyping, STOPPED_TYPING_WAITTIME)
    const startThrottled = throttle(startedTyping, MAX_TYPING_INTERVAL, { trailing: false })
    const keyDown = e => {
      this.setState({enabled: this.refs.editor.getContent().length > 0})
      startThrottled()
      onCmdOrCtrlEnter(e => {
        e.preventDefault()
        this.submit()
      }, e)
    }

    const { enabled, modifierKey } = this.state

    return <form onSubmit={this.submit} className='comment-form'>
      <Avatar person={currentUser}/>
      {editing
        ? <div className='content'>
            {editingTagDescriptions && <TagDescriptionEditor
              saveParent={this.saveWithTagDescriptions}/>}
            <RichTextEditor ref='editor' name='comment' startFocused
              content={text}
              onBlur={() => updateStore(this.refs.editor.getContent())}
              onChange={setText}
              onKeyUp={keyUp}
              onKeyDown={keyDown}/>
            <input type='submit' value='Post' ref='button'
              className={cx({enabled})}/>
            {close && <button onClick={close}>Cancel</button>}
            {!isMobile && modifierKey && <span className='meta help-text'>
              or press {modifierKey}-Enter
            </span>}
          </div>
        : <div className='content placeholder' onClick={edit}>
            {placeholder}
          </div>}
    </form>
  }
}
