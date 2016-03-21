import React from 'react'
import Post from '../components/Post'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { find, get } from 'lodash'
import {
  FETCH_POST,
  fetchComments,
  fetchPost,
  setCurrentCommunityId,
  setMetaTags
} from '../actions'
import { fetchPeople } from '../actions/fetchPeople'
import { ogMetaTags } from '../util'
import PostEditor from '../components/PostEditor'
import { scrollToAnchor } from '../util/scrolling'
import { findError } from '../actions/util'
import AccessErrorMessage from '../components/AccessErrorMessage'
import CoverImagePage from '../components/CoverImagePage'

const SinglePost = props => {
  const { post, community, currentUser, editing, error } = props

  if (error) return <AccessErrorMessage error={error}/>
  if (!post) return <div className='loading'>Loading...</div>
  if (editing) return <PostEditor post={post} expanded={true}/>
  const image = get(community, 'banner_url') || 'http://i.imgur.com/G5WpY72.jpg'

  return <CoverImagePage id='single-post' image={image}>
    <Post post={post} expanded={true} showComments={true} commentingDisabled={!currentUser}/>
  </CoverImagePage>
}

export default compose(
  prefetch(({ store, dispatch, params: { id } }) => Promise.all([
    dispatch(fetchPost(id))
    .then(({ error, payload }) => {
      if (error) return
      const post = store.getState().posts[id]
      const communityId = get(post, 'communities.0') || 'all'
      dispatch(setCurrentCommunityId(communityId))

      if (!payload || payload.api) return
      const { name, description, media } = payload
      dispatch(setMetaTags(ogMetaTags(name, description, media[0])))
    }),
    dispatch(fetchComments(id))
    .then(({ error }) => {
      if (error || typeof window === 'undefined') return

      let anchor = get(window.location.hash.match(/#(comment-\d+$)/), '1')
      if (anchor) scrollToAnchor(anchor, 15)
    }),
    dispatch(fetchPeople({subject: 'voters', id}))
  ])),
  connect((state, { params }) => {
    const { communities, currentCommunityId } = state
    return {
      post: state.posts[params.id],
      community: find(communities, c => c.id === currentCommunityId),
      currentUser: state.people.current,
      editing: state.postEdits[params.id],
      error: findError(state.errors, FETCH_POST, 'posts', params.id)
    }
  })
)(SinglePost)
