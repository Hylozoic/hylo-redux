import React from 'react'
import ModalOnlyPage from '../../components/ModalOnlyPage'
import { CommunityHeader } from '../Signup'
import { newestMembership } from '../../models/currentUser'
import BrowseTopicsModal from '../BrowseTopicsModal'
const { func, object } = React.PropTypes

const TopicsPrompt = (props, { currentUser, dispatch }) => {
  const { community } = newestMembership(currentUser)

  return <ModalOnlyPage id='topics-prompt' className='login-signup'>
    <CommunityHeader community={community}/>
    <BrowseTopicsModal onboarding/>
  </ModalOnlyPage>
}
TopicsPrompt.contextTypes = {currentUser: object, dispatch: func}

export default TopicsPrompt
