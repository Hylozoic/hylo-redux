import React from 'react'
import Post from '../components/Post'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { find, get, includes } from 'lodash'
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
import EventPost from '../components/EventPost'
import { fetch, ConnectedPostList } from './ConnectedPostList'

const subject = 'tag'

const showTaggedPosts = post =>
  post.type === 'event' && post.tag && !includes(['event', 'chat'], post.tag)

const SinglePost = props => {
  const { post, community, currentUser, editing, error, location: { query } } = props

  if (error) return <AccessErrorMessage error={error}/>
  if (!post) return <div className='loading'>Loading...</div>

  return <CoverImagePage id='single-post' image={get(community, 'banner_url')}>
    {editing
      ? <PostEditor post={post} expanded={true}/>
      : showPost(post, currentUser)}

    {showTaggedPosts(post) && <div>
      <p className='meta'>
        Other posts for&nbsp;
        <span className='hashtag'>#{post.tag}</span>
      </p>
      <ConnectedPostList subject={subject} id={post.tag} omit={post.id}
        query={{...query, communityId: community.id}}/>
    </div>}
  </CoverImagePage>
}

const showPost = (post, currentUser) =>
  post.type === 'event'
    ? <EventPost post={post}/>
    : <Post post={post} expanded={true}/>

const setCommunityAndMetaTags = (store, dispatch, id) =>
  ({ error, payload, cacheHit }) => {
    if (error) return cacheHit
    const post = store.getState().posts[id]
    const communityId = get(post, 'communities.0') || 'all'
    dispatch(setCurrentCommunityId(communityId))

    if (payload && !payload.api) {
      const { name, description, media } = payload
      dispatch(setMetaTags(ogMetaTags(name, description, media[0])))
    }

    return cacheHit
  }

const fetchMoreComments = (store, dispatch, id) => hit => {
  // when this page is clicked into from a post list, fetchPost will cause a
  // cache hit; however, there may be more comments than the 3 that were
  // included in the list, so we have to call fetchComments to retrieve the
  // rest. but when fetchPost did not cause a cache hit, we know that its
  // response contained all comments, so we can skip the additional call.
  if (!hit) return
  const post = store.getState().posts[id]
  if (post.numComments > 3) return dispatch(fetchComments(id, {offset: 3}))
}

const scroll = () => {
  if (typeof window === 'undefined') return
  let anchor = get(window.location.hash.match(/#(comment-\d+$)/), '1')
  if (anchor) scrollToAnchor(anchor, 15)
}

const fetchTaggedPosts = (store, dispatch, query, id) => () => {
  const post = store.getState().posts[id]
  const communityId = get(post, 'communities.0') || 'all'
  return dispatch(fetch(subject, post.tag, {...query, communityId, omit: post.id}))
}

export default compose(
  prefetch(({ store, dispatch, params: { id }, query }) =>
    dispatch(fetchPost(id))
    .then(setCommunityAndMetaTags(store, dispatch, id))
    .then(fetchMoreComments(store, dispatch, id))
    .then(scroll)
    .then(fetchTaggedPosts(store, dispatch, query, id))),
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
