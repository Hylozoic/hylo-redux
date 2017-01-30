import React from 'react'
import { connect } from 'react-redux'
import { get } from 'lodash'
import {
  closeModal, navigate, showDirectMessage, findOrCreateThread
} from '../actions'
import { threadUrl } from '../routes'
import { Modal } from '../components/Modal'
import MessageToUserForm from '../components/MessageToUserForm'
import PersonChooser from '../components/PersonChooser'
const { func, object, string } = React.PropTypes

@connect((state, { userId }) => {
  return ({
    currentUser: get(state, 'people.current'),
    postId: state.threadsByUser[userId]
  })
})
export default class DirectMessageModal extends React.Component {
  static propTypes = {
    postId: string,
    userId: string,
    userName: string,
    onCancel: func
  }

  static contextTypes = {dispatch: func, currentUser: object}

  componentDidMount () {
    const { dispatch } = this.context
    const { postId, userId } = this.props
    if (userId && !postId) dispatch(findOrCreateThread(userId))
    if (!userId) this.refs.personChooser.getWrappedInstance().focus()
    else this.refs.messageForm.getWrappedInstance().focus()
  }

  onSelect = (person) => {
    const { dispatch } = this.context
    dispatch(showDirectMessage(person.id, person.name))
  }

  render () {
    const { onCancel, postId, userId, userName } = this.props
    const { dispatch, currentUser } = this.context
    const title = userId ? `You and ${userName}`
      : <PersonChooser ref='personChooser' placeholder='Start typing a name...' onSelect={this.onSelect}
          typeaheadId='messageTo' exclude={currentUser} />

    const onComplete = () => {
      dispatch(navigate(threadUrl(postId)))
      dispatch(closeModal())
      onCancel()
    }

    return <Modal {...{title}} id='direct-message' onCancel={onCancel}>
      <MessageToUserForm ref='messageForm' {...{userId, onComplete, postId}} />
    </Modal>
  }
}
