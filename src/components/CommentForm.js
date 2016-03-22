import React from 'react'
import { get } from 'lodash'
import { connect } from 'react-redux'
import Avatar from './Avatar'
import { createComment } from '../actions'
import { ADDED_COMMENT, trackEvent } from '../util/analytics'
var { func, string, object } = React.PropTypes

@connect(state => ({currentUser: get(state, 'people.current')}))
export default class CommentForm extends React.Component {
  static propTypes = {
    currentUser: object,
    dispatch: func,
    postId: string
  }

  submit = event => {
    let { dispatch, postId } = this.props
    event.preventDefault()
    dispatch(createComment(postId, this.refs.editor.value))
    trackEvent(ADDED_COMMENT, {post: {id: postId}})
    this.refs.editor.value = ''
  }

  render () {
    let { currentUser } = this.props
    return <form onSubmit={this.submit} className='comment-form'>
      <Avatar person={currentUser}/><input type='text' ref='editor' placeholder='Add your comment'/>
    </form>
  }
}
