import React from 'react'
import Post from '../components/Post'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { get, includes } from 'lodash'
import { pick } from 'lodash/fp'
import {
  FETCH_POST,
  fetchComments,
  fetchLeftNavTags,
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
import ProjectPost from '../components/ProjectPost'
import { getCurrentCommunity } from '../models/community'
import { getComments, getCommunities, getPost } from '../models/post'
import { fetch, ConnectedPostList } from './ConnectedPostList'
const { array, bool, object, string } = React.PropTypes

const subject = 'tag'

const showTaggedPosts = post =>
  post.tag && !includes(['event', 'chat'], post.tag) &&
  includes(['event', 'project'], post.type)

@prefetch(({ store, dispatch, params: { id }, query }) =>
  dispatch(fetchPost(id))
  .then(setCommunityAndMetaTags(store, dispatch, id))
  .then(fetchMoreComments(store, dispatch, id))
  .then(scroll)
  .then(fetchYetMore(store, dispatch, query, id)))
@connect((state, { params: { id } }) => {
  const post = getPost(id, state)
  return {
    post,
    community: getCurrentCommunity(state),
    communities: getCommunities(post, state),
    comments: getComments(post, state),
    currentUser: state.people.current,
    editing: state.postEdits[id],
    error: findError(state.errors, FETCH_POST, 'posts', id)
  }
})
export default class SinglePost extends React.Component {
  static propTypes = {
    post: object,
    community: object,
    editing: bool,
    error: string,
    location: object
  }

  static childContextTypes = {
    community: object,
    communities: array,
    post: object,
    comments: array
  }

  getChildContext () {
    return pick(['community', 'post', 'comments', 'communities'], this.props)
  }

  render () {
    const { post, community, editing, error, location: { query } } = this.props

    if (error) return <AccessErrorMessage error={error}/>
    if (!post || !community) return <div className='loading'>Loading...</div>

    return <CoverImagePage id='single-post' image={get(community, 'banner_url')}>
      {editing
        ? <PostEditor post={post} expanded={true}/>
        : showPost(post)}

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
}

const showPost = (post) => {
  switch (post.type) {
    case 'event': return <EventPost post={post}/>
    case 'project': return <ProjectPost/>
  }
  return <Post post={post} expanded={true}/>
}

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

const fetchYetMore = (store, dispatch, query, id) => () => {
  const state = store.getState()
  const post = state.posts[id]
  if (!post) return
  const communityId = get(post, 'communities.0') || 'all'
  const slug = get(state.communities, [communityId, 'slug'])
  return Promise.all([
    dispatch(fetch(subject, post.tag, {...query, communityId, omit: post.id})),
    slug && dispatch(fetchLeftNavTags(slug))
  ])
}
