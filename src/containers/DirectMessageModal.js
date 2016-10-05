import React from 'react'
import { connect } from 'react-redux'
import { get } from 'lodash'
import { getCurrentCommunity, getFollowedTags } from '../models/community'
import { closeModal, navigate, showDirectMessage } from '../actions'
import { findOrCreateThread } from '../actions/threads'
import { threadUrl } from '../routes'
import { modalWrapperCSSId, Modal } from '../components/Modal'
import MessageToUserForm from '../components/MessageToUserForm'
import PersonChooser from '../components/PersonChooser'
import { newestMembership } from '../models/currentUser'
const { array, bool, func, number, object, string } = React.PropTypes

const PersonPicker = (props) => {
  const { onSelect } = props
  const select = (person) => {
    onSelect(person.id, person.name)
  }
  return <PersonChooser
           placeholder='Start typing a name...'
           onSelect={select}
           typeaheadId='messageTo'/>
}
PersonPicker.propTypes = {
  onSelect: func
}

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

  static contextTypes = {
    dispatch: func
  }

  componentDidMount() {
    const { dispatch } = this.context
    const { postId, userId } = this.props
    if (userId && !postId) dispatch(findOrCreateThread(userId))
  }

  onSelect (userId, userName) {
    const { dispatch } = this.context
    dispatch(showDirectMessage(userId, userName))
    dispatch(findOrCreateThread(userId))
  }

  render () {
    const { onCancel, postId, userId, userName } = this.props
    const { dispatch } = this.context
    const title = userId ? `You and ${userName}` : <PersonPicker onSelect={this.onSelect.bind(this)}/>

    const onComplete = () => {
      dispatch(navigate(threadUrl(postId)))
      onCancel()
    }

    return <Modal {...{title}} id='direct-message' onCancel={onCancel}>
      <MessageToUserForm {...{userId, onComplete, postId}}/>
    </Modal>
  }
}


