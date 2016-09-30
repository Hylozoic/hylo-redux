import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { getCurrentCommunity } from '../models/community'
import { closeModal } from '../actions'
import { Modal } from '../components/Modal'
import { fetchCommunity, updateCommunityChecklist } from '../actions/communities'
const { func, object } = React.PropTypes

@prefetch(({ dispatch, params: { id } }) =>
  dispatch(updateCommunityChecklist(id))
  .then(() => dispatch(fetchCommunity(id)))
)
@connect((state) => ({
  community: getCurrentCommunity(state)
}))
export default class ChecklistModal extends React.Component {
  static propTypes = {
    dispatch: func,
    community: object,
    onCancel: func
  }

  render () {
    const { dispatch, onCancel } = this.props
    const close = () => dispatch(closeModal())

    return <Modal title='Invite.'
      subtitle={'To build a successful community with Hylo, we suggest completing the following:'}
      className='create-community-three'
      onCancel={onCancel}>
      <div className='footer'>
        <a className='button ok' onClick={close}>
          Done
        </a>
      </div>
    </Modal>
  }
}
