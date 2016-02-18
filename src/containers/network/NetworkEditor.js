import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchCommunities } from '../../actions/fetchCommunities'
import { fetchWithCache, connectedListProps } from '../../util/caching'
import CommunityCards from '../../components/CommunityCards'
import {
  createNetwork,
  resetNetworkValidation,
  updateNetworkEditor,
  validateNetworkAttribute,
  fetchNetwork,
  updateNetwork
} from '../../actions/network'
const { array, bool, func, number, object, string } = React.PropTypes

const subject = 'network'
const fetch = fetchWithCache(fetchCommunities)
const query = {offset: 0, limit: 1000}

@prefetch(({ dispatch, params: { id } }) => {
  id && dispatch(fetchNetwork(id, true))
  return dispatch(fetch(subject, id, query))
})
@connect((state, { params: { id } }) => {
  return {
    ...connectedListProps(state, {subject, id, query}, 'communities'),
    network: state.networks[id],
    currentUser: state.people.current
  }
})
export default class NetworkEditor extends React.Component {
  static propTypes = {
    id: string,
    saving: bool,
    uploadingImage: bool,
    validating: bool,
    errors: object,
    dispatch: func,
    network: object,
    networkEdit: object,
    currentUser: object,
    communityChoices: array,
    communities: array,
    pending: bool,
    total: number,
    params: object,
    location: object
  }

  render () {
    let { pending, communities, currentUser, network } = this.props
    if (!currentUser) return <div>Loading...</div>

    console.log('in render, network', network)
    console.log('in render, network.name', network.name)

    return <div className='communities'>
      <div className='list-controls'>
        <input type='text' className='form-control search'
          placeholder='Search' />
      </div>
      {pending && <div className='loading'>Loading...</div>}
      <CommunityCards communities={communities}/>
    </div>
  }
}
