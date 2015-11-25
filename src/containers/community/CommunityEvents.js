import React from 'react'
import { fetchPosts } from '../../actions'
import { prefetch } from 'react-fetcher'
import ConnectedPostList from '../../containers/ConnectedPostList'
import { createCacheId } from '../../util/caching'
const { func, object } = React.PropTypes

const fetch = (id, opts = {}) => {
  let subject = 'community'
  let type = 'event'
  let cacheId = createCacheId({subject, id, type})
  return fetchPosts({subject, id, type, cacheId, limit: 20, ...opts})
}

@prefetch(({ dispatch, params }) => dispatch(fetch(params.id)))
export default class CommunityEvents extends React.Component {
  static propTypes = {
    dispatch: func,
    params: object,
    community: object
  }

  render () {
    let { id } = this.props.params
    let cacheId = createCacheId({subject: 'community', id, type: 'event'})
    return <div>
      <ConnectedPostList fetch={opts => fetch(id, opts)} id={cacheId}/>
    </div>
  }
}
