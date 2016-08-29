import React from 'react'
import { get, debounce, throttle } from 'lodash'
import { connect } from 'react-redux'
import Avatar from './Avatar'
import RichTextEditor from './RichTextEditor'
import { createComment, updateCommentEditor, updateComment } from '../actions'
import { ADDED_COMMENT, trackEvent } from '../util/analytics'
import { textLength } from '../util/text'
import { onCmdEnter } from '../util/textInput'
import TagDescriptionEditor from './TagDescriptionEditor'
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

  constructor (props) {
    super(props)
    this.state = {}
  }

  submit = event => {
    const { dispatch, postId, commentId, newComment, close } = this.props
    if (event) event.preventDefault()
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

  render () {
    let { currentUser, editingTagDescriptions, dispatch, postId, commentId, text, newComment, close, startedTyping, stoppedTyping } = this.props
    const editing = text !== undefined
    const storeId = newComment ? postId : commentId
    const updateStore = text => dispatch(updateCommentEditor(storeId, text, newComment))
    const edit = () => updateStore('')

    const setText = event => updateStore(event.target.value)
    const placeholder = this.props.placeholder || 'Add a comment...'

    const onKeyUp = debounce(stoppedTyping, STOPPED_TYPING_WAITTIME)
    const startThrottled = throttle(startedTyping, MAX_TYPING_INTERVAL, { trailing: false })
    const onKeyDown = event => {
      startThrottled()
      onCmdEnter(e => {
        e.preventDefault()
        this.submit()
      })(event)
    }

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
              onKeyDown={onKeyDown}
              onKeyUp={onKeyUp}/>
            <input type='submit' value='Comment' ref='button'/>
            {close && <button onClick={close}>Cancel</button>}
          </div>
        : <div className='content placeholder' onClick={edit}>
            {placeholder}
          </div>}
    </form>
  }
}
