import React from 'react'
import { get } from 'lodash'
import { connect } from 'react-redux'
import Avatar from './Avatar'
import RichTextEditor from './RichTextEditor'
import { createComment } from '../actions'
import { ADDED_COMMENT, trackEvent } from '../util/analytics'
import { textLength } from '../util/text'
import TagDescriptionEditor from './TagDescriptionEditor'
var { array, bool, func, object, string } = React.PropTypes

@connect(state => ({
  currentUser: get(state, 'people.current'),
  editingTagDescriptions: state.editingTagDescriptions
}))
export default class CommentForm extends React.Component {
  static propTypes = {
    currentUser: object,
    dispatch: func,
    postId: string,
    mentionOptions: array,
    placeholder: string,
    editingTagDescriptions: bool
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  submit = event => {
    const { dispatch, postId } = this.props
    const { text } = this.state
    if (event) event.preventDefault()
    if (!text || textLength(text) < 2) return

    // this is to make sure the last edit in TinyMCE gets saved on mobile,
    // because the blur event doesn't fire when the button is tapped otherwise
    this.refs.button.focus()
    setTimeout(() => {
      dispatch(createComment(postId, this.state.text, this.state.tagDescriptions))
      .then(({ error }) => {
        if (error) return
        trackEvent(ADDED_COMMENT, {post: {id: postId}})
        this.refs.editor.setContent('')
        this.setState({text: '', editing: false})
      })
    })
  }

  saveWithTagDescriptions = tagDescriptions => {
    this.setState({tagDescriptions})
    this.submit()
  }

  render () {
    const { currentUser, editingTagDescriptions } = this.props
    const { editing } = this.state
    const edit = () => this.setState({editing: true})
    const setText = event => this.setState({text: event.target.value})
    const placeholder = this.props.placeholder || 'Add a comment...'

    return <form onSubmit={this.submit} className='comment-form'>
      <Avatar person={currentUser}/>
      {editing
        ? <div className='content'>
            {editingTagDescriptions && <TagDescriptionEditor
              onSave={this.saveWithTagDescriptions}/>}
            <RichTextEditor ref='editor' name='comment' startFocused
              onChange={setText}/>
            <input type='submit' value='Comment' ref='button'/>
          </div>
        : <div className='content placeholder' onClick={edit}>
            {placeholder}
          </div>}
    </form>
  }
}
