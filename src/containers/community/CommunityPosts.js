import React from 'react'
import { fetchPosts } from '../../actions/fetchPosts'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import ConnectedPostList from '../../containers/ConnectedPostList'
import PostEditor from '../../components/PostEditor'
import PostListControls from '../../components/PostListControls'
import { createCacheId } from '../../util/caching'
const { func, object } = React.PropTypes

const initialFetchOpts = {type: 'all+welcome', sort: 'recent'}

const fetch = (id, opts = initialFetchOpts) => {
  let { type, sort } = opts
  let subject = 'community'
  let cacheId = createCacheId({subject, id, type, sort})
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

  constructor (props) {
    super(props)
    this.state = initialFetchOpts
  }

  changeQuery = opts => {
    let { dispatch, params } = this.props
    dispatch(fetch(params.id, {...this.state, ...opts}))
    this.setState(opts)
  }

  render () {
    let { community, params: { id } } = this.props
    let { type, sort } = this.state
    let cacheId = createCacheId({subject: 'community', id, type, sort})

    return <div>
      <PostEditor community={community}/>
      <PostListControls onChange={this.changeQuery}
        includeWelcome={true}
        type={type}
        sort={sort}
        search=''/>
      <ConnectedPostList fetch={opts => fetch(id, opts)} id={cacheId}/>
    </div>
  }
}
