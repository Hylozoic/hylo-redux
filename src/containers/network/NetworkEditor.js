import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchCommunities } from '../../actions/fetchCommunities'
import { fetchWithCache, connectedListProps } from '../../util/caching'
import CommunityCards from '../../components/CommunityCards'
import {
  CREATE_NETWORK,
  UPLOAD_IMAGE,
  navigate,
  typeahead
} from '../../actions'
import {
  createNetwork,
  resetNetworkValidation,
  updateNetworkEditor,
  validateNetworkAttribute,
  fetchNetwork,
  updateNetwork
} from '../../actions/network'
import { some, omit, filter, startsWith, contains } from 'lodash'
const { array, bool, func, number, object, string } = React.PropTypes

const defaultBanner = 'https://d3ngex8q79bk55.cloudfront.net/misc/default_community_banner.jpg'
const defaultAvatar = 'https://d3ngex8q79bk55.cloudfront.net/misc/default_community_avatar.png'

const typeaheadId = 'network_communities'

const subject = 'network'
const fetch = fetchWithCache(fetchCommunities)
const query = {offset: 0, limit: 1000}

@prefetch(({ dispatch, params: { id } }) => {
  id && dispatch(fetchNetwork(id, true))
  return dispatch(fetch(subject, id, query))
})
@connect((state, { params: { id } }) => {
  let { people, networks, networkValidation, pending, typeaheadMatches, networkEdits } = state
  let validating = some(networkValidation.pending)
  let saving = pending[CREATE_NETWORK]
  let uploadingImage = !!pending[UPLOAD_IMAGE]
  let currentUser = people.current

  if (!id) id = 'new'

  let network = networks[id]

  let networkEdit = {...network, ...networkEdits[id]}

  let { errors } = networkEdit

  if (!errors) errors = {}
  // errors.nameUsed = get(networkValidation, 'name.unique') === false
  // errors.slugUsed = get(networkValidation, 'slug.unique') === false

  if (!networkEdit.avatar_url) networkEdit.avatar_url = defaultAvatar
  if (!networkEdit.banner_url) networkEdit.banner_url = defaultBanner

  let clp = connectedListProps(state, {subject, id, query}, 'communities')

  return {
    ...connectedListProps(state, {subject, id, query}, 'communities'),
    id, network, networkEdit, errors, validating, saving, uploadingImage, currentUser,
    communityChoices: typeaheadMatches[typeaheadId] || []
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
