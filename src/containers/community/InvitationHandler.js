import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { get } from 'lodash'
import CommunityHeader from '../../components/CommunityHeader'
import SkillsPrompt from '../onboarding/SkillsPrompt'
import Modal from '../../components/Modal'
import A from '../../components/A'
import ModalOnlyPage from '../../components/ModalOnlyPage'
import { useInvitation } from '../../actions'
import { USE_INVITATION } from '../../actions/constants'
import { defaultAvatar } from '../../models/community'
import { navigateAfterJoin } from '../../util/navigation'
const { func, object, string } = React.PropTypes

@prefetch(({ path, query: { token }, store, dispatch }) =>
  dispatch(useInvitation(token))
  .then(({ error, payload: { community, tagName, preexisting } }) =>
    error || dispatch(navigateAfterJoin(community, tagName, preexisting))))
@connect(({ errors, people, communities }, { location: { query: { token } } }) => ({
  tokenError: get(errors[USE_INVITATION], 'payload.response.body')
}))
export default class InvitationHandler extends React.Component {
  static propTypes = {
    dispatch: func,
    params: object,
    tokenError: string
  }

  render () {
    let { tokenError } = this.props
    let errorMessage
    switch (tokenError) {
      case 'bad token':
        errorMessage = 'This invitation link is not valid.'
        break
      case 'used token':
        errorMessage = 'This invitation link has already been used.'
        break
    }

    const mockCommunity = {name: '... checking invitation link...', avatar_url: defaultAvatar}
    const mockLocation = {pathname: '', query: {}}

    if (tokenError) {
      return <ModalOnlyPage id='invitation-error' className='login-signup'>
        <CommunityHeader community={mockCommunity} />
        <Modal standalone>
          <div className='alert alert-danger'>{errorMessage}</div>
          <div className='modal-input'><A to='/app'>Click here</A> to view your communities</div>
        </Modal>
      </ModalOnlyPage>
    } else {
      return <SkillsPrompt location={mockLocation} community={mockCommunity} />
    }
  }
}
