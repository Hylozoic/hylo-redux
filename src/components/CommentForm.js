import React from 'react'
import { get } from 'lodash'
import { connect } from 'react-redux'
import Avatar from './Avatar'
import RichTextEditor from './RichTextEditor'
import { createComment, typeahead } from '../actions'
import { ADDED_COMMENT, trackEvent } from '../util/analytics'
import { personTemplate } from '../util/mentions'
var { array, func, object, string } = React.PropTypes

@connect(state => ({
  currentUser: get(state, 'people.current'),
  mentionChoices: get(state, 'typeaheadMatches.comment')
}))
export default class CommentForm extends React.Component {
  static propTypes = {
    currentUser: object,
    dispatch: func,
    postId: string,
    mentionChoices: array
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  submit = event => {
    let { dispatch, postId } = this.props
    event.preventDefault()
    dispatch(createComment(postId, this.state.text))
    trackEvent(ADDED_COMMENT, {post: {id: postId}})
    this.refs.editor.setContent('')
    this.setState({text: ''})
  }

  render () {
    const { currentUser, dispatch, mentionChoices } = this.props
    const { editing } = this.state
    const edit = () => this.setState({editing: true})
    const setText = event => this.setState({text: event.target.value})

    return <form onSubmit={this.submit} className='comment-form'>
      <Avatar person={currentUser}/>
      {editing
        ? <div className='content'>
            <RichTextEditor ref='editor'
              onChange={setText}
              mentionTemplate={personTemplate}
              mentionTypeahead={text => dispatch(typeahead(text, 'comment'))}
              mentionChoices={mentionChoices}
              mentionSelector='[data-user-id]'
              startFocused={true}/>
            <input type='submit' value='Comment'/>
          </div>
        : <div className='content placeholder' onClick={edit}>
            Add a comment...
          </div>}
    </form>
  }
}
