import React from 'react'
import { fetchPosts } from '../../actions'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import PostList from '../../components/PostList'
const { array, func, object } = React.PropTypes

@prefetch(({dispatch, params: {slug}}) => {
  return dispatch(fetchPosts({subject: 'community', id: slug, limit: 20}))
})
@connect((state, props) => {
  let { slug } = props.params
  return {
    posts: state.postsByCommunity[slug],
    postsTotal: state.totalPostsByCommunity[slug]
  }
})
export default class CommunityPosts extends React.Component {
  static propTypes = {
    posts: array,
    dispatch: func,
    params: object
  }

  loadMore = () => {
    let { posts, dispatch, params } = this.props
    dispatch(fetchPosts({
      subject: 'community',
      id: params.id,
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
