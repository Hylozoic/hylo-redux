import React from 'react'
import Post from '../components/Post'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { fetchComments, fetchPost, setMetaTags } from '../actions'
import { join } from 'bluebird'
import truncate from 'html-truncate'
import striptags from 'striptags'
const { object } = React.PropTypes

const SinglePost = props => {
  let { post, currentUser } = props
  if (!post) return <div className='loading'>Loading...</div>

  return <div>
    <Post post={post} expanded={true} commentsExpanded={true} commentingDisabled={!currentUser}/>
  </div>
}

SinglePost.propTypes = {
  post: object.isRequired
}

export default compose(
  prefetch(({ dispatch, params }) => join(
    dispatch(fetchPost(params.id))
    .then(action => {
      let post = action.payload
      let { media } = post
      var metaTags = {
        'og:title': post.name,
        'og:description': truncate(striptags(post.description || ''), 140)
      }
      if (media[0]) {
        metaTags = {...metaTags, ...{
          'og:image': media[0].url,
          'og:image:width': media[0].width,
          'og:image:height': media[0].height
        }}
      }
      return dispatch(setMetaTags(metaTags))
    }),
    dispatch(fetchComments(params.id))
  )),
  connect(({ posts, people }, { params }) => ({
    post: posts[params.id],
    currentUser: people.current
  }))
)(SinglePost)
