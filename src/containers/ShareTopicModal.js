import React from 'react'
import { connect } from 'react-redux'
import { closeModal } from '../actions'
import A from '../components/A'
import { Modal } from '../components/Modal'
const { func, string } = React.PropTypes

closeModal
A

@connect()
export default class ShareTopicModal extends React.Component {
  static propTypes = {
    dispatch: func,
    onCancel: func,
    tagName: string,
    slug: string
  }

  render () {
    let { onCancel, tagName, slug } = this.props
    return <Modal title='Invite to join conversation' id='share-topic' onCancel={onCancel}>
      Tag Name: {tagName}<br />
      Slug: {slug}
    </Modal>
  }
}
