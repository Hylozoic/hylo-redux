import React from 'react'
import { connect } from 'react-redux'
import { closeModal, fetchCommunitySettings } from '../actions'
import A from '../components/A'
import { Modal } from '../components/Modal'
import { communityTagJoinUrl } from '../routes'
import { get } from 'lodash'
const { func, string, object } = React.PropTypes

closeModal
A

@connect((state, { slug }) => ({
  community: state.communities[slug]
}))
export default class ShareTopicModal extends React.Component {
  static propTypes = {
    dispatch: func,
    onCancel: func,
    tagName: string,
    slug: string,
    community: object
  }

  componentDidMount () {
    let { dispatch, slug, community } = this.props
    if (get(community, 'beta_access_code')) return
    dispatch(fetchCommunitySettings(slug))
  }

  render () {
    let { onCancel, tagName, community } = this.props
    let loaded = get(community, 'beta_access_code')
    let joinUrl
    if (loaded) joinUrl = communityTagJoinUrl(community, tagName)

    return <Modal title='Invite to join conversation' id='share-topic' onCancel={onCancel}>
      {loaded ? <div><A to={joinUrl}>{joinUrl}</A></div> : <div>Loading...</div>}

    </Modal>
  }
}
