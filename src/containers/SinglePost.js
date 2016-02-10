import React from 'react'
import Post from '../components/Post'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { fetchComments, fetchPost, setMetaTags } from '../actions'
import { ogMetaTags } from '../util'
import PostEditor from '../components/PostEditor'
const { object } = React.PropTypes

const SinglePost = props => {
  let { post, currentUser, editing } = props
  if (!post) return <div className='loading'>Loading...</div>

  if (editing) {
    return <PostEditor post={post} expanded={true}/>
  }

  return <div>
    <Post post={post} expanded={true} commentsExpanded={true} commentingDisabled={!currentUser}/>
  </div>
}

SinglePost.propTypes = {
  post: object.isRequired
}

export default compose(
  prefetch(({ dispatch, params }) => Promise.all([
    dispatch(fetchPost(params.id))
    .then(action => {
      let payload = action.payload
      if (payload && !payload.api) {
        return dispatch(setMetaTags(ogMetaTags(payload.name, payload.description, payload.media[0])))
      }
    }),
    dispatch(fetchComments(params.id))
  ])),
  connect(({ posts, people, postEdits }, { params }) => ({
    post: posts[params.id],
    currentUser: people.current,
    editing: postEdits[params.id]
  }))
)(SinglePost)
