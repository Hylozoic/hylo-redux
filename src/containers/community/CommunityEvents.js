import React from 'react'
import { fetchPosts } from '../../actions'
import { prefetch } from 'react-fetcher'
import ConnectedPostList from '../../containers/ConnectedPostList'
const { func, object } = React.PropTypes
import qs from 'querystring'

const fetch = (id, opts = {}) =>
  fetchPosts({subject: 'community', id, type: 'event', limit: 20, ...opts})

@prefetch(({ dispatch, params }) => dispatch(fetch(params.id)))
export default class CommunityEvents extends React.Component {
  static propTypes = {
    dispatch: func,
    params: object,
    community: object
  }

  render () {
    let { id } = this.props.params
    let type = 'event'
    let query = qs.stringify({id, type})
    return <div>
      <ConnectedPostList fetch={opts => fetch(id, opts)} query={query}/>
    </div>
  }
}
