import React from 'react'
import { fetchPosts, FETCH_POSTS } from '../../actions'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import PostList from '../../components/PostList'
const { array, bool, func, number, object } = React.PropTypes

@prefetch(({dispatch, params: {slug}}) => {
  return dispatch(fetchPosts({subject: 'community', id: slug, limit: 20}))
})
@connect((state, props) => {
  let { slug } = props.params
  return {
    posts: state.postsByCommunity[slug],
    total: state.totalPostsByCommunity[slug],
    pending: state.pending[FETCH_POSTS]
  }
})
export default class CommunityPosts extends React.Component {
  static propTypes = {
    posts: array,
    total: number,
    dispatch: func,
    params: object,
    pending: bool
  }

  loadMore = () => {
    let { posts, dispatch, params, total, pending } = this.props
    if (posts.length >= total || pending) return

    dispatch(fetchPosts({
      subject: 'community',
      id: params.slug,
      offset: posts.length,
      limit: 20
    }))
  }

  render () {
    return <div>
      <PostList posts={this.props.posts || []} loadMore={this.loadMore}/>
    </div>
  }
}

/*
<PostEditor/>
<PostList posts={this.props.posts}
  type='community'
  ownerId={community.id}
  total={this.props.postsTotal}/>
*/
