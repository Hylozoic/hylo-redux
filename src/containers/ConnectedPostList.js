import React from 'react'
import { connect } from 'react-redux'
import PostList from '../components/PostList'
import { FETCH_POSTS, fetchPosts } from '../actions/fetchPosts'
import { debug } from '../util/logging'
import { cleanAndStringify } from '../util/caching'
import { navigate } from '../actions'
const { array, bool, func, number, object, string } = React.PropTypes

const createCacheId = (subject, id, query = {}) => {
  let { type, sort, search, filter } = query
  let cacheId = cleanAndStringify({subject, id, type, sort, search, filter})
  return cacheId
}

export const fetch = (subject, id, query = {}) => {
  let { type } = query
  let cacheId = createCacheId(subject, id, query)
  return fetchPosts({subject, id, type, cacheId, limit: 20, ...query})
}

export const refetch = (opts, { dispatch, location: { query, pathname } }) => {
  let newQuery = cleanAndStringify({...query, ...opts})
  let newPath = `${pathname}${newQuery ? '?' + newQuery : ''}`
  dispatch(navigate(newPath))
}

@connect(({ postsByQuery, totalPostsByQuery, pending }, { subject, id, query }) => {
  let cacheId = createCacheId(subject, id, query)
  return {
    posts: postsByQuery[cacheId],
    total: totalPostsByQuery[cacheId],
    pending: pending[FETCH_POSTS]
  }
})
export class ConnectedPostList extends React.Component {
  static propTypes = {
    subject: string.isRequired,
    id: string.isRequired,
    posts: array,
    dispatch: func,
    total: number,
    pending: bool,
    query: object
  }

  loadMore = () => {
    let { posts, dispatch, total, pending, subject, id, query } = this.props
    if (total && posts.length >= total || pending) return

    let offset = posts.length
    dispatch(fetch(subject, id, {...query, offset}))
  }

  render () {
    let { posts, total, pending } = this.props
    if (!posts) posts = []
    debug(`posts: ${posts.length} / ${total || '??'}`)
    return <PostList posts={posts} loadMore={this.loadMore} pending={pending}/>
  }
}

export default ConnectedPostList
