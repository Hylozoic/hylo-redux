import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { getCurrentCommunity } from '../models/community'
import { closeModal, fetchCommunity } from '../actions'
import Modal from '../components/Modal'
import PostEditor from '../components/PostEditor'
const { func, object, string } = React.PropTypes

@prefetch(({ dispatch, params: { id } }) =>
  dispatch(fetchCommunity(id))
)
@connect((state) => ({
  community: getCurrentCommunity(state)
}))
export default class PostEditorModal extends React.Component {
  static propTypes = {
    dispatch: func,
    community: object,
    post: object,
    tag: string
  }

  render () {
    const { dispatch, community, post, tag } = this.props
    const close = () => dispatch(closeModal())
    const onSave = () => window.scrollTo(0, 0)

    return <Modal>
      <PostEditor community={community} onCancel={close} post={post} tag={tag}
        onSave={onSave} expanded />
    </Modal>
  }
}
