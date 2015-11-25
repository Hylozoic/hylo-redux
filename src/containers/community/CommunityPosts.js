import React from 'react'
import { fetchPosts, FETCH_POSTS } from '../../actions'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import PostList from '../../components/PostList'
import PostEditor from '../../components/PostEditor'
import { debug } from '../../util/logging'
const { array, bool, func, number, object } = React.PropTypes
import qs from 'querystring'

const postType = 'all+welcome'

const _fetchPosts = (id, params) =>
  fetchPosts({subject: 'community', id, type: postType, limit: 20, ...params})

@prefetch(({ dispatch, params: { id } }) => {
  return dispatch(_fetchPosts(id))
})
@connect((state, props) => {
  let { id } = props.params
  let query = qs.stringify({id, type: postType})
  return {
    posts: state.postsByQuery[query],
    total: state.totalPostsByQuery[query],
    pending: state.pending[FETCH_POSTS],
    community: state.communities[id]
  }
})
export default class CommunityPosts extends React.Component {
  static propTypes = {
    posts: array,
    total: number,
    dispatch: func,
    params: object,
    pending: bool,
    community: object
  }

  loadMore = () => {
    let { posts, dispatch, params: { id }, total, pending } = this.props
    if (total && posts.length >= total || pending) return

    let offset = posts.length
    dispatch(_fetchPosts(id, {offset}))
  }

  render () {
    let { pending, total, posts, community } = this.props
    if (!posts) posts = []
    debug(`posts: ${posts.length} / ${total || '??'}`)
    return <div>
      {pending && <div className='loading'>Loading...</div>}
      <PostEditor community={community}/>
      <PostList posts={posts} loadMore={this.loadMore}/>
    </div>
  }
}
