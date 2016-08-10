import React from 'react'
import Modal from '../../components/Modal'
import ModalOnlyPage from '../../components/ModalOnlyPage'
import ModalInput from '../../components/ModalInput'
import { updateUserSettings } from '../../actions'
import A from '../../components/A'
import { debounce } from 'lodash'
import { CommunityHeader } from '../Signup'
import { newestMembership } from '../../models/currentUser'
const { func, object } = React.PropTypes

const BioPrompt = (props, { currentUser, dispatch }) => {
  const { community } = newestMembership(currentUser)
  const update = debounce(bio =>
    dispatch(updateUserSettings(currentUser.id, {bio})), 500)

  return <ModalOnlyPage id='bio-prompt' className='login-signup'>
    <CommunityHeader community={community}/>
    <Modal standalone title='How would you describe yourself in 140 characters?'>
      <ModalInput label='Describe yourself' maxLength='140'
        defaultValue={currentUser.bio || ''}
        onChange={event => update(event.target.value)}/>
      <div className='footer'>
        <A className='button' to='/choose-topics'>Next</A>
      </div>
    </Modal>
  </ModalOnlyPage>
}
BioPrompt.contextTypes = {currentUser: object, dispatch: func}

export default BioPrompt
