import React from 'react'
import { fetchPosts } from '../../actions'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import ConnectedPostList from '../../containers/ConnectedPostList'
import PostEditor from '../../components/PostEditor'
import { createCacheId } from '../../util/caching'
const { func, object } = React.PropTypes

const fetch = (id, opts = {}) => {
  let subject = 'community'
  let type = 'all+welcome'
  let cacheId = createCacheId({subject, id, type})
  return fetchPosts({subject, id, type, cacheId, limit: 20, ...opts})
}

@prefetch(({ dispatch, params }) => dispatch(fetch(params.id)))
@connect((state, { params }) => ({community: state.communities[params.id]}))
export default class CommunityPosts extends React.Component {
  static propTypes = {
    dispatch: func,
    params: object,
    community: object
  }

  render () {
    let { community, params: { id } } = this.props
    let cacheId = createCacheId({subject: 'community', id, type: 'all+welcome'})
    return <div>
      <PostEditor community={community}/>
      <ConnectedPostList fetch={opts => fetch(id, opts)} id={cacheId}/>
    </div>
  }
}
