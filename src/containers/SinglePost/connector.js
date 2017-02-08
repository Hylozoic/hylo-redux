import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { includes } from 'lodash'
import { get } from 'lodash/fp'
import { ogMetaTags } from '../../util'
import { scrollToComment } from '../../util/scrolling'
import { getCurrentCommunity } from '../../models/community'
import { denormalizedPost, getComments, getPost, isMessageThread } from '../../models/post'
import {
  navigate,
  notify,
  setMetaTags,
  fetchComments,
  fetchCommunity,
  fetchPost,
  unfollowPost,
  saveCurrentCommunityId,
  findError
} from '../../actions'
import { FETCH_POST } from '../../actions/constants'
import { fetch } from '../../containers/ConnectedPostList'
import { subject } from './component'

export function fetchToState ({ store, dispatch, params: { id }, query }) {
  return dispatch(fetchPost(id))
    .then(action => {
      if (action.error) return action
      if (action.payload.parent_post_id) {
        return dispatch(fetchPost(action.payload.parent_post_id))
          .then(() => action)
      } else {
        return action
      }
    })
    .then(action =>
      redirect(store, id) || setupPage(store, id, query, action)
    )
}

export function mapStateToProps (state, { params: { id } }) {
  const post = getPost(id, state)
  const parentPost = post ? getPost(post.parent_post_id, state) : null
  return {
    post: post ? denormalizedPost(post, state) : null,
    parentPost: parentPost ? denormalizedPost(parentPost, state) : null,
    community: getCurrentCommunity(state),
    comments: getComments(post, state),
    editing: !!state.postEdits[id],
    error: findError(state.errors, FETCH_POST, 'posts', id)
  }
}

export default compose(
  prefetch(fetchToState),
  connect(mapStateToProps)
)

const redirect = (store, id) => {
  const state = store.getState()
  const post = state.posts[id]
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
  let communityIds
  if (post.parent_post_id) {
    communityIds = posts[post.parent_post_id].community_ids
  } else {
    communityIds = post.community_ids
  }
  const communityId = includes(communityIds, currentCommunityId)
    ? currentCommunityId
    : (get('0', communityIds) || 'all')

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
    post.type === 'project' && dispatch(fetch(subject, id, {...query})),

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
