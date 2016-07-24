import React from 'react'
import { get } from 'lodash'
import { connect } from 'react-redux'
import Avatar from './Avatar'
import RichTextEditor from './RichTextEditor'
import { createComment, updateCommentEditor } from '../actions'
import { ADDED_COMMENT, trackEvent } from '../util/analytics'
import { textLength } from '../util/text'
import { onCmdEnter } from '../util/textInput'
import TagDescriptionEditor from './TagDescriptionEditor'
var { array, bool, func, object, string } = React.PropTypes

@connect((state, { postId }) => ({
  currentUser: get(state, 'people.current'),
  editingTagDescriptions: state.editingTagDescriptions,
  text: state.commentEdits[postId]
}))
export default class CommentForm extends React.Component {
  static propTypes = {
    currentUser: object,
    dispatch: func,
    postId: string,
    mentionOptions: array,
    placeholder: string,
    editingTagDescriptions: bool,
    text: string
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  submit = event => {
    const { dispatch, postId, text } = this.props
    if (event) event.preventDefault()
    if (!text || textLength(text) < 2) return

    setTimeout(() => {
      // use the current state of the editor rather than props to ensure we get the last
      // edits on mobile, especially after an @mention
      dispatch(createComment(postId, this.refs.editor.getContent(), this.state.tagDescriptions))
      .then(({ error }) => {
        if (error) return
        trackEvent(ADDED_COMMENT, {post: {id: postId}})
      })
    })
  }

  saveWithTagDescriptions = tagDescriptions => {
    this.setState({tagDescriptions})
    this.submit()
  }

  render () {
    const { currentUser, editingTagDescriptions, dispatch, postId, text } = this.props
    const editing = text !== undefined
    const updateStore = text => dispatch(updateCommentEditor(postId, text))
    const edit = () => updateStore('')

    const setText = event => updateStore(event.target.value)
    const placeholder = this.props.placeholder || 'Add a comment...'
    const quickSubmit = onCmdEnter(e => {
      e.preventDefault()
      this.submit()
    })

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
              onKeyDown={quickSubmit}/>
            <input type='submit' value='Comment' ref='button'/>
          </div>
        : <div className='content placeholder' onClick={edit}>
            {placeholder}
          </div>}
    </form>
  }
}
