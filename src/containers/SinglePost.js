import React from 'react'
import Post from '../components/Post'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { includes } from 'lodash'
import { get, pick } from 'lodash/fp'
import { FETCH_POST, navigate, notify, setMetaTags } from '../actions'
import { fetchComments } from '../actions/comments'
import { fetchCommunity } from '../actions/communities'
import { fetchPost, unfollowPost } from '../actions/posts'
import { saveCurrentCommunityId } from '../actions/util'
import { ogMetaTags } from '../util'
import A from '../components/A'
import PostEditor from '../components/PostEditor'
import { scrollToComment } from '../util/scrolling'
import { findError } from '../actions/util'
import AccessErrorMessage from '../components/AccessErrorMessage'
import CoverImagePage from '../components/CoverImagePage'
import EventPost from '../components/EventPost'
import ProjectPost from '../components/ProjectPost'
import { getCurrentCommunity } from '../models/community'
import { denormalizedPost, getComments, getPost, isMessageThread } from '../models/post'
import { fetch, ConnectedPostList } from './ConnectedPostList'
const { array, bool, object, string, func } = React.PropTypes

const subject = 'community'

@prefetch(({ store, dispatch, params: { id }, query }) =>
  dispatch(fetchPost(id))
  .then(action =>
    redirect(store, id) || setupPage(store, id, query, action)))
@connect((state, { params: { id } }) => {
  const post = getPost(id, state)
  return {
    post: post ? denormalizedPost(post, state) : null,
    community: getCurrentCommunity(state),
    comments: getComments(post, state),
    editing: !!state.postEdits[id],
    error: findError(state.errors, FETCH_POST, 'posts', id)
  }
})
export default class SinglePost extends React.Component {
  static propTypes = {
    post: object,
    community: object,
    editing: bool,
    error: string,
    dispatch: func,
    location: object
  }

  static childContextTypes = {
    community: object,
    post: object,
    comments: array
  }

  static contextTypes = {
    isMobile: bool,
    currentUser: object
  }

  getChildContext () {
    return pick(['community', 'post', 'comments'], this.props)
  }

  render () {
    const { post, community, editing, error, location: { query } } = this.props
    const { currentUser, isMobile } = this.context
    if (error) return <AccessErrorMessage error={error}/>
    if (!post || !post.user) return <div className='loading'>Loading...</div>
    const isChild = !!post.parent_post_id

    return <div>
      {isMobile && isChild && <div id='mobile-top-bar'>
        <A className='back' to={`/p/${post.parent_post_id}`}>
          <span className='left-angle-bracket'>&#x3008;</span>
          Back to project
        </A>
      </div>}
      <CoverImagePage id='single-post' image={get('banner_url', community)}>
        {editing ? <PostEditor post={post} expanded/> : showPost(post)}

        {post.type === 'project' && <div>
          {currentUser && <PostEditor community={community} parentPostId={post.id}/>}
          {community && <ConnectedPostList subject={subject} id={community.id}
            query={{...query, parent_post_id: post.id}}
            noPostsMessage=''/>}
        </div>}
      </CoverImagePage>
    </div>
  }
}

const showPost = (post) => {
  switch (post.type) {
    case 'event': return <EventPost post={post}/>
    case 'project': return <ProjectPost/>
  }
  return <Post post={post} expanded/>
}

const redirect = (store, id) => {
  const state = store.getState()
  const post = state.posts[id]
  if (!state.isMobile && get('parent_post_id', post)) {
    store.dispatch(navigate(`/p/${post.parent_post_id}`))
    return true
  }
  if (isMessageThread(post)) {
    store.dispatch(navigate(`/t/${post.id}`))
    return true
  }
}

const setupPage = (store, id, query, action) => {
  const { error, payload, cacheHit } = action
  const { dispatch } = store
  if (error) return
  const state = store.getState()
  const { currentCommunityId, posts, people } = state
  const post = posts[id]
  if (!post) return

  const currentUser = people.current
  const { community_ids } = post
  const communityId = includes(community_ids, currentCommunityId)
    ? currentCommunityId
    : (get('0', community_ids) || 'all')

  if (payload && !payload.api) {
    const { name, description, media } = payload
    dispatch(setMetaTags(ogMetaTags(name, description, get('0', media))))
  }

  return Promise.all([
    communityId !== currentCommunityId &&
      saveCurrentCommunityId(dispatch, communityId, !!currentUser),

    // Always load the full record for the current Community record
    dispatch(fetchCommunity(communityId)),

    // when this page is clicked into from a post list, fetchPost will cause a
    // cache hit; however, there may be more comments than the 3 that were
    // included in the list, so we have to call fetchComments to retrieve the
    // rest. but when fetchPost did not cause a cache hit, we know that its
    // response contained all comments, so we can skip the additional call.
    cacheHit && post.numComments > 3 &&
      dispatch(fetchComments(id, {refresh: true})).then(scroll),

    // if this is a project, fetch the first page of results for child posts.
    post.type === 'project' && dispatch(fetch(subject, communityId,
      {...query, parent_post_id: post.id})),

    get('action', query) === 'unfollow' && currentUser &&
      dispatch(unfollowPost(post.id, currentUser.id)).then(({ error }) => !error &&
        dispatch(notify('Notifications for this post are now off.',
          {type: 'info', maxage: null})))
  ])
}

const scroll = () => {
  if (typeof window === 'undefined') return
  let id = get(window.location.hash.match(/#comment-(\d+)$/), '1')
  if (id) scrollToComment(id)
}
