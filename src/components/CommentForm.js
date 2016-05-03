import React from 'react'
import { get } from 'lodash'
import { connect } from 'react-redux'
import Avatar from './Avatar'
import RichTextEditor from './RichTextEditor'
import { createComment } from '../actions'
import { ADDED_COMMENT, trackEvent } from '../util/analytics'
import { textLength } from '../util/text'
var { array, func, object, string } = React.PropTypes

@connect(state => ({
  currentUser: get(state, 'people.current')
}))
export default class CommentForm extends React.Component {
  static propTypes = {
    currentUser: object,
    dispatch: func,
    postId: string,
    mentionOptions: array
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  submit = event => {
    const { dispatch, postId } = this.props
    const { text } = this.state
    event.preventDefault()
    if (!text || textLength(text) < 2) return

    dispatch(createComment(postId, this.state.text))
    trackEvent(ADDED_COMMENT, {post: {id: postId}})
    this.refs.editor.setContent('')
    this.setState({text: ''})
  }

  render () {
    const { currentUser } = this.props
    const { editing } = this.state
    const edit = () => this.setState({editing: true})
    const setText = event => this.setState({text: event.target.value})

    return <form onSubmit={this.submit} className='comment-form'>
      <Avatar person={currentUser}/>
      {editing
        ? <div className='content'>
            <RichTextEditor ref='editor' name='comment'
              onChange={setText}
              startFocused={true}/>
            <input type='submit' value='Comment'/>
          </div>
        : <div className='content placeholder' onClick={edit}>
            Add a comment...
          </div>}
    </form>
  }
}
