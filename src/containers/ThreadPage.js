import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { get, includes } from 'lodash'
import { pick } from 'lodash/fp'
import {
  FETCH_POST, navigate, setMetaTags
} from '../actions'
import { fetchComments } from '../actions/comments'
import { fetchPost } from '../actions/posts'
import { ogMetaTags } from '../util'
import A from '../components/A'
import { findError } from '../actions/util'
import AccessErrorMessage from '../components/AccessErrorMessage'
import Thread from '../components/Thread'
import { denormalizedPost, getComments, getPost } from '../models/post'
const { array, bool, object, string, func } = React.PropTypes


@prefetch(({ store, dispatch, params: { id }, query }) =>
  dispatch(fetchPost(id))
  .then(action => setupPage(store, id, query, action)))
@connect((state, { params: { id } }) => {
  const post = getPost(id, state)
  return {
    post: denormalizedPost(post, state),
    comments: getComments(post, state),
    error: findError(state.errors, FETCH_POST, 'posts', id)
  }
})
export default class ThreadPage extends React.Component {
  static propTypes = {
    post: object,
    error: string
  }

  static childContextTypes = {
    post: object,
    comments: array
  }

  static contextTypes = {
    isMobile: bool,
    currentUser: object
  }

  getChildContext () {
    return pick(['post', 'comments'], this.props)
  }

  render () {
    const { post, error } = this.props
    const { currentUser, isMobile } = this.context
    if (error) return <AccessErrorMessage error={error}/>
    if (!post || !post.user) return <div className='loading'>Loading...</div>

    return <Thread post={post} />
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
  const userId = get(state.people, 'current.id')

  if (payload && !payload.api) {
    const { name, description, media } = payload
    dispatch(setMetaTags(ogMetaTags(name, description, get(media, '0'))))
  }

  return dispatch(fetchComments(id))
}

