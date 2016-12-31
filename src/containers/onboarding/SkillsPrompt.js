import React from 'react'
const { func, object } = React.PropTypes
import { connect } from 'react-redux'
import { find, map } from 'lodash/fp'

import { updateUserSettings } from '../../actions'
import { nextOnboardingUrl } from '../../util/navigation'
import Modal from '../../components/Modal'
import ModalOnlyPage from '../../components/ModalOnlyPage'
import CommunityHeader from '../../components/CommunityHeader'
import ListItemTagInput from '../../components/ListItemTagInput'
import A from '../../components/A'

const SkillsPrompt = ({ location, community }, { currentUser, dispatch }) => {
  community = community || find(c => c.slug === location.query.community,
    map('community', currentUser.memberships))

  const title = `Are there any skills, passions or interests you'd like to be
  known for in your community?`

  const subtitle = `Pick "tags" to describe yourself and to find people and
  opportunities that match your interests.`

  const update = (path, value) => dispatch(updateUserSettings({[path]: value}))

  const nextUrl = () => nextOnboardingUrl(location)

  return <ModalOnlyPage id='skills-prompt' className='login-signup'>
    <CommunityHeader community={community}/>
    <Modal standalone {...{title, subtitle}}>
      <ListItemTagInput
        type='tags'
        className='modal-input'
        person={currentUser}
        update={update}
        context='onboarding' />
      <span className='meta'>
        Press Enter (Return) after each tag. Use a dash (-) between words in a tag.
      </span>
      <div className='footer'>
        <A className='button' to={nextUrl}>Next</A>
      </div>
    </Modal>
  </ModalOnlyPage>
}
SkillsPrompt.contextTypes = {currentUser: object, dispatch: func}

export default connect()(SkillsPrompt)
