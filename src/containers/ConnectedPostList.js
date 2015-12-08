import React from 'react'
import { connect } from 'react-redux'
import PostList from '../components/PostList'
import { fetchPosts } from '../actions/fetchPosts'
import { debug } from '../util/logging'
import { connectedListProps, fetchWithCache } from '../util/caching'
import { isEqual } from 'lodash'
const { array, bool, func, number, object, string } = React.PropTypes

export const fetch = fetchWithCache(fetchPosts)

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
    let offset = posts.length
    if (!pending && offset < total) {
      dispatch(fetch(subject, id, {...query, offset}))
    }
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
