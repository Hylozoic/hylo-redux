import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetchPosts } from '../../actions'
import ConnectedPostList from '../ConnectedPostList'
import { createCacheId } from '../../util/caching'
const { func, object } = React.PropTypes

const fetch = (id, opts = {}) => {
  let subject = 'person'
  let type = 'all'
  let cacheId = createCacheId({subject, id, type})
  return fetchPosts({subject, id, type, cacheId, limit: 20, ...opts})
}

@prefetch(({ dispatch, params }) => dispatch(fetch(params.id)))
@connect((state, { params }) => ({person: state.people[params.id]}))
export default class PersonPosts extends React.Component {
  static propTypes = {
    person: object,
    params: object,
    dispatch: func
  }

  render () {
    let { id } = this.props.params
    let cacheId = createCacheId({subject: 'person', id, type: 'all'})
    return <div>
      <ConnectedPostList fetch={opts => fetch(id, opts)} id={cacheId}/>
    </div>
  }
}
