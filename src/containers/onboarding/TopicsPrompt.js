import React from 'react'
import ModalOnlyPage from '../../components/ModalOnlyPage'
import { CommunityHeader } from '../Signup'
import BrowseTopicsModal from '../BrowseTopicsModal'
import { nextOnboardingUrl } from '../../util/navigation'
import { find, map } from 'lodash/fp'
const { func, object } = React.PropTypes

const TopicsPrompt = ({ location }, { currentUser, dispatch }) => {
  const community = find(c => c.slug === location.query.community,
    map('community', currentUser.memberships))

  return <ModalOnlyPage id='topics-prompt' className='login-signup'>
    <CommunityHeader community={community}/>
    <BrowseTopicsModal community={community} onboarding
      nextUrl={nextOnboardingUrl(location)}/>
  </ModalOnlyPage>
}
TopicsPrompt.contextTypes = {currentUser: object, dispatch: func}

export default TopicsPrompt
