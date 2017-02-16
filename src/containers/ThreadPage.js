import React from 'react'
import { prefetch } from 'react-fetcher'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { fetchPost, fetchComments, findError } from '../actions'
import { FETCH_POST } from '../actions/constants'
import AccessErrorMessage from '../components/AccessErrorMessage'
import Thread from '../components/Thread'
import { denormalizedPost, getPost } from '../models/post'
const { object } = React.PropTypes

function ThreadPage ({ post, error }) {
  if (error) return <AccessErrorMessage error={error} />
  if (!post || !post.user) return <div className='loading'>Loading...</div>
  return <Thread post={post} />
}
ThreadPage.propTypes = {post: object, error: object}

function fetchToState ({ dispatch, params: { id } }) {
  return dispatch(fetchPost(id, {minimal: true}))
  .then(() =>
    dispatch(fetchComments(id, {refresh: true, newest: true, limit: 50})))
}

function mapStateToProps (state, { params: { id } }) {
  const post = getPost(id, state)
  return {
    post: post ? denormalizedPost(post, state) : null,
    error: findError(state.errors, FETCH_POST, 'posts', id)
  }
}

export default compose(
  prefetch(fetchToState),
  connect(mapStateToProps)
)(ThreadPage)
