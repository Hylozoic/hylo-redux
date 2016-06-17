import React from 'react'
import { connect } from 'react-redux'
import { closeModal, fetchCommunitySettings } from '../actions'
import A from '../components/A'
import { Modal } from '../components/Modal'
import { communityTagJoinUrl } from '../routes'
import { get } from 'lodash'
const { func, string, object } = React.PropTypes

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
      <div className='join-url'>
        <label>Copy Link</label>
        {loaded
        ? <A to={joinUrl}>{joinUrl}</A>
      : <span>Loading...</span>}
      </div>
      <div className='invite'>
        <label>People</label>
        <input type='text'
          placeholder='Enter email addresses'
          onChange={event => console.log('changing emails')}/>
      </div>
      <div className='footer'>
        <button onClick={closeModal}>Done</button>
        <button onClick={closeModal} className='ok'>Invite</button>
      </div>
    </Modal>
  }
}
