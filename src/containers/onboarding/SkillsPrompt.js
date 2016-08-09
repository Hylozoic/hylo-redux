import React from 'react'
import Modal from '../../components/Modal'
import ModalOnlyPage from '../../components/ModalOnlyPage'
import ListItemTagInput from '../../components/ListItemTagInput'
import { preventSpaces } from '../../util/textInput'
import { updateUserSettings } from '../../actions'
import A from '../../components/A'
const { func, object } = React.PropTypes

const SkillsPrompt = (props, { currentUser, dispatch }) => {
  const update = (path, value) =>
    dispatch(updateUserSettings(currentUser.id, {[path]: value}))
  return <ModalOnlyPage id='skills-prompt' className='login-signup'>
    <Modal standalone title="Are there any skills, passions or hobbies you'd like to be known for in your community?">
      <ListItemTagInput type='tags' person={currentUser}
        className='modal-input'
        filter={preventSpaces}
        update={update}/>
      <div className='footer'>
        <A to='/add-bio'>Next</A>
      </div>
    </Modal>
  </ModalOnlyPage>
}
SkillsPrompt.contextTypes = {currentUser: object, dispatch: func}

export default SkillsPrompt
