import React from 'react'
import ModalOnlyPage from '../../components/ModalOnlyPage'
import { CommunityHeader } from '../Signup'
import { getCommunity } from '../../models/currentUser'
import BrowseTopicsModal from '../BrowseTopicsModal'
import { nextOnboardingUrl } from '../../util/navigation'
const { func, object } = React.PropTypes

const TopicsPrompt = ({ location }, { currentUser, dispatch }) => {
  const community = getCommunity(currentUser, {slug: location.query.community})

  return <ModalOnlyPage id='topics-prompt' className='login-signup'>
    <CommunityHeader community={community}/>
    <BrowseTopicsModal onboarding nextUrl={nextOnboardingUrl(location)}/>
  </ModalOnlyPage>
}
TopicsPrompt.contextTypes = {currentUser: object, dispatch: func}

export default TopicsPrompt
