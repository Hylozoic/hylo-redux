import React from 'react'
import { connect } from 'react-redux'
import {
  closeModal
} from '../actions'
import { SimpleModal } from '../components/Modal'
const { func, object } = React.PropTypes
import Post from '../components/Post'

@connect(({ posts }, { id }) => ({post: posts[id]}))
export default class ExpandedPostModal extends React.Component {
  static propTypes = {
    dispatch: func,
    post: object
  }
  render () {
    const { dispatch, post } = this.props
    const close = () => dispatch(closeModal())
    return <SimpleModal onCancel={close}>
      <Post post={post} expanded onCancel={close}/>
    </SimpleModal>
  }
}
