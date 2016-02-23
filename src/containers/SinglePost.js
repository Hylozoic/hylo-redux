import React from 'react'
import Post from '../components/Post'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { find, get } from 'lodash'
import { FETCH_POST, fetchComments, fetchPost, setMetaTags } from '../actions'
import { ogMetaTags } from '../util'
import PostEditor from '../components/PostEditor'
import { scrollToAnchor } from '../util/scrolling'

const SinglePost = props => {
  let { post, currentUser, editing, error } = props

  if (error) {
    let errorMessage
    switch (error.status) {
      case 403:
        errorMessage = "You don't have permission to view this page."
        break
      case 404:
        errorMessage = 'Page not found.'
        break
      default:
        errorMessage = 'An error occurred.'
    }
    return <div className='alert alert-danger'>
      {errorMessage}&ensp;
      <a href='javascript:history.go(-1)'>Back</a>
    </div>
  }

  if (!post) return <div className='loading'>Loading...</div>

  if (editing) {
    return <PostEditor post={post} expanded={true}/>
  }

  return <div>
    <Post post={post} expanded={true} commentsExpanded={true} commentingDisabled={!currentUser}/>
  </div>
}

const findAccessError = (action, postId) => {
  let match = action => get(action, 'meta.cache.id') === postId &&
    get(action, 'meta.cache.bucket') === 'posts'

  return get(find([action], match), 'payload.response')
}

export default compose(
  prefetch(({ dispatch, params }) => Promise.all([
    dispatch(fetchPost(params.id))
    .then(({ error, payload }) => {
      if (error || !payload || payload.api) return
      let { name, description, media } = payload
      return dispatch(setMetaTags(ogMetaTags(name, description, media[0])))
    }),
    dispatch(fetchComments(params.id))
    .then(({ error }) => {
      if (error || typeof window === 'undefined') return

      let anchor = get(window.location.hash.match(/#(comment-\d+$)/), '1')
      if (anchor) scrollToAnchor(anchor, 15)
    })
  ])),
  connect(({ posts, people, postEdits, errors }, { params }) => ({
    post: posts[params.id],
    currentUser: people.current,
    editing: postEdits[params.id],
    error: findAccessError(errors[FETCH_POST], params.id)
  }))
)(SinglePost)
