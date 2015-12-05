import React from 'react'
import { connect } from 'react-redux'
import PostList from '../components/PostList'
import { fetchPosts } from '../actions/fetchPosts'
import { debug } from '../util/logging'
import { createCacheId, cleanAndStringify, connectedListProps } from '../util/caching'
import { navigate } from '../actions'
import { isEqual } from 'lodash'
const { array, bool, func, number, object, string } = React.PropTypes

export const fetch = (subject, id, query = {}) => {
  let { type } = query
  let cacheId = createCacheId(subject, id, query)
  return fetchPosts({subject, id, type, cacheId, limit: 20, ...query})
}

export const refetch = (opts, { dispatch, location: { query, pathname } }, defaults) => {
  let newQuery = cleanAndStringify({...query, ...opts}, defaults)
  let newPath = `${pathname}${newQuery ? '?' + newQuery : ''}`
  dispatch(navigate(newPath))
}

@connect((state, props) => connectedListProps(state, props, 'posts'))
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

  shouldComponentUpdate (nextProps) {
    return !isEqual(this.props, nextProps)
  }

  render () {
    let { posts, total, pending } = this.props
    if (!posts) posts = []
    debug(`posts: ${posts.length} / ${total || '??'}`)
    return <PostList posts={posts} loadMore={this.loadMore} pending={pending}/>
  }
}

export default ConnectedPostList
