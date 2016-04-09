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

  return <CoverImagePage id='single-post' image={get(community, 'banner_url')}>
    {editing
      ? <PostEditor post={post} expanded={true}/>
      : <Post post={post} expanded={true} commentingDisabled={!currentUser}/>}
  </CoverImagePage>
}

export default compose(
  prefetch(({ store, dispatch, params: { id } }) =>
    dispatch(fetchPost(id))
    .then(({ error, payload, cacheHit }) => {
      if (error) return cacheHit
      const post = store.getState().posts[id]
      const communityId = get(post, 'communities.0') || 'all'
      dispatch(setCurrentCommunityId(communityId))

      if (payload && !payload.api) {
        const { name, description, media } = payload
        dispatch(setMetaTags(ogMetaTags(name, description, media[0])))
      }

      return cacheHit
    })
    .then(hit => {
      // when this page is clicked into from a post list, fetchPost above will
      // cause a cache hit; however, there may be more comments than the 3 that
      // were included in the list, so we have to call fetchComments to retrieve
      // the rest. but when fetchPost did not cause a cache hit, we know that
      // its response contained all comments, so we can skip the additional
      // call.
      if (!hit) return
      const post = store.getState().posts[id]
      if (post.numComments > 3) return dispatch(fetchComments(id, {offset: 3}))
    })
    .then(() => {
      if (typeof window === 'undefined') return
      let anchor = get(window.location.hash.match(/#(comment-\d+$)/), '1')
      if (anchor) scrollToAnchor(anchor, 15)
    })),
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
