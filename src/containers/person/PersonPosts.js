import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetchPosts } from '../../actions'
import ConnectedPostList from '../ConnectedPostList'
import qs from 'querystring'
const { func, object } = React.PropTypes

const fetch = (id, opts = {}) =>
  fetchPosts({subject: 'person', id, type: 'all', limit: 20, ...opts})

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
    let type = 'all'
    let query = qs.stringify({id, type})
    return <div>
      <ConnectedPostList fetch={opts => fetch(id, opts)} query={query}/>
    </div>
  }
}
