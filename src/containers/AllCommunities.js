import React from 'react'
import { prefetch } from 'react-fetcher'
import CoverImagePage from '../components/CoverImagePage'
import { setCurrentCommunityId } from '../actions'

const AllCommunities = ({ children }) =>
  <CoverImagePage>{children}</CoverImagePage>

const setCommunityId = ({ dispatch }) => dispatch(setCurrentCommunityId('all'))

export default prefetch(setCommunityId)(AllCommunities)
