import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { FETCH_POST } from '../actions'
import { fetchComments } from '../actions/comments'
import { fetchPost } from '../actions/posts'
import { findError } from '../actions/util'
import AccessErrorMessage from '../components/AccessErrorMessage'
import Thread from '../components/Thread'
import { denormalizedPost, getComments, getPost } from '../models/post'
const { array, bool, func, object } = React.PropTypes

@prefetch(({ dispatch, params: { id } }) =>
  dispatch(fetchPost(id, {minimal: true}))
  .then(() => dispatch(fetchComments(id, {refresh: true, newest: true, limit: 20}))))
@connect((state, { params: { id } }) => {
  const post = getPost(id, state)
  return {
    post: post ? denormalizedPost(post, state) : null,
    comments: getComments(post, state),
    error: findError(state.errors, FETCH_POST, 'posts', id)
  }
})
export default class ThreadPage extends React.Component {
  static propTypes = {
    post: object,
    comments: array,
    error: object,
    dispatch: func
  }

  static contextTypes = {
    isMobile: bool,
    currentUser: object
  }

  render () {
    const { post, comments, error } = this.props
    if (error) return <AccessErrorMessage error={error} />
    if (!post || !post.user) return <div className='loading'>Loading...</div>

    return <Thread post={post} comments={comments} />
  }
}
