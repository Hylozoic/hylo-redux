import React from 'react'
import Post from '../components/Post'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { get, includes } from 'lodash'
import { pick } from 'lodash/fp'
import { FETCH_POST, navigate, setMetaTags } from '../actions'
import { fetchComments } from '../actions/comments'
import { fetchPost } from '../actions/posts'
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
import { denormalizedPost, getComments, getPost } from '../models/post'
import { fetch, ConnectedPostList } from './ConnectedPostList'
const { array, bool, object, string, func } = React.PropTypes

const subject = 'community'

const showTaggedPosts = post =>
  post.tag && post.tag !== 'event' && includes(['event', 'project'], post.type)

@prefetch(({ store, dispatch, params: { id }, query }) =>
  dispatch(fetchPost(id))
  .then(action =>
    redirectToParent(store, id) || setupPage(store, id, query, action)))
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
      <CoverImagePage id='single-post' image={get(community, 'banner_url')}>
        {editing ? <PostEditor post={post} expanded/> : showPost(post)}

        {showTaggedPosts(post) && <div>
          {currentUser && <PostEditor community={community} tag={post.tag}/>}
          <p className='meta other-posts-label'>
            Other posts for&nbsp;
            <span className='hashtag'>#{post.tag}</span>
          </p>
          {community && <ConnectedPostList subject={subject} id={community.id}
            omit={post.id}
            query={{...query, tag: post.tag}}/>}
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

const redirectToParent = (store, id) => {
  const state = store.getState()
  if (state.isMobile) return false
  const post = state.posts[id]
  if (get(post, 'parent_post_id')) {
    store.dispatch(navigate(`/p/${post.parent_post_id}`))
    return true
  }
}

const setupPage = (store, id, query, action) => {
  const { error, payload, cacheHit } = action
  const { dispatch } = store
  if (error) return
  const state = store.getState()
  const post = state.posts[id]
  if (!post) return

  const communityId = get(post, 'communities.0') || 'all'

  if (payload && !payload.api) {
    const { name, description, media } = payload
    dispatch(setMetaTags(ogMetaTags(name, description, get(media, '0'))))
  }

  return Promise.all([
    saveCurrentCommunityId(dispatch, communityId, !!state.people.current),

    // when this page is clicked into from a post list, fetchPost will cause a
    // cache hit; however, there may be more comments than the 3 that were
    // included in the list, so we have to call fetchComments to retrieve the
    // rest. but when fetchPost did not cause a cache hit, we know that its
    // response contained all comments, so we can skip the additional call.
    cacheHit && post.numComments > 3 && dispatch(fetchComments(id, {offset: 3})),

    // if this is an event or project, fetch the first page of results for
    // tagged posts.
    showTaggedPosts(post) && dispatch(fetch(subject, communityId,
      {...query, tag: post.tag, omit: post.id}))
  ])
  .then(scroll) // must be deferred until after comments are loaded
}

const scroll = () => {
  if (typeof window === 'undefined') return
  let id = get(window.location.hash.match(/#comment-(\d+)$/), '1')
  if (id) scrollToComment(id)
}
