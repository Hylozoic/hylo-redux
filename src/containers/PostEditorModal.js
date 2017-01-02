import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { getCurrentCommunity } from '../models/community'
import { closeModal } from '../actions'
import { Modal } from '../components/Modal'
import PostEditor from '../components/PostEditor'
import { fetchCommunity } from '../actions/communities'
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
    onCancel: func,
    post: object,
    tag: string
  }

  render () {
    const { dispatch, onCancel, community, post, tag } = this.props
    const close = () => dispatch(closeModal())

    return <Modal onCancel={onCancel}>
      <PostEditor community={community} onCancel={close} post={post} tag={tag} expanded/>
    </Modal>
  }
}
