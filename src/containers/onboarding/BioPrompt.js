import React from 'react'
import Modal from '../../components/Modal'
import ModalOnlyPage from '../../components/ModalOnlyPage'
import { ModalInput } from '../../components/ModalRow'
import { updateUserSettings } from '../../actions'
import A from '../../components/A'
import { debounce } from 'lodash'
import { find, map } from 'lodash/fp'
import { CommunityHeader } from '../Signup'
import { nextOnboardingUrl } from '../../util/navigation'
const { func, object } = React.PropTypes

const BioPrompt = ({ location }, { currentUser, dispatch }) => {
  const community = find(c => c.slug === location.query.community,
    map('community', currentUser.memberships))
  const update = debounce(bio =>
    dispatch(updateUserSettings({bio})), 500)

  return <ModalOnlyPage id='bio-prompt' className='login-signup'>
    <CommunityHeader community={community}/>
    <Modal standalone title='How would you describe yourself in 140 characters?'>
      <ModalInput label='Describe yourself' maxLength='140'
        defaultValue={currentUser.bio || ''}
        onChange={event => update(event.target.value)}/>
      <div className='footer'>
        <A className='button' to={nextOnboardingUrl(location)}>Next</A>
      </div>
    </Modal>
  </ModalOnlyPage>
}
BioPrompt.contextTypes = {currentUser: object, dispatch: func}

export default BioPrompt
