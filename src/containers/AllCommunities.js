import React from 'react'
import { prefetch } from 'react-fetcher'
import CoverImagePage from '../components/CoverImagePage'
import { setCurrentCommunityIdLocalAndRemote } from '../actions/util'
import { get } from 'lodash'

const AllCommunities = ({ children }) =>
  <CoverImagePage>{children}</CoverImagePage>

const setCommunityId = ({ dispatch, store }) => {
  const userId = get(store.getState().people.current, 'id')
  return setCurrentCommunityIdLocalAndRemote(dispatch, 'all', userId)
}

export default prefetch(setCommunityId)(AllCommunities)
