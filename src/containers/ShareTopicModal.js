import React from 'react'
import { connect } from 'react-redux'
import validator from 'validator'
import {
  closeModal, fetchCommunitySettings, updateTagInvitationEditor, sendCommunityTagInvitation,
  SEND_COMMUNITY_TAG_INVITATION
} from '../actions'
import A from '../components/A'
import { Modal } from '../components/Modal'
import { communityTagJoinUrl } from '../routes'
import { parseEmailString } from '../util/text'
import { get, isEmpty, some } from 'lodash'
import cx from 'classnames'
const { func, string, object, bool } = React.PropTypes

@connect(({ communities, tagInvitationEditor, pending }, { slug }) => ({
  community: communities[slug],
  tagInvitationEditor,
  pending: pending[SEND_COMMUNITY_TAG_INVITATION]

}))
export default class ShareTopicModal extends React.Component {
  static propTypes = {
    dispatch: func,
    onCancel: func,
    tagName: string,
    slug: string,
    community: object,
    tagInvitationEditor: object,
    pending: bool
  }

  componentDidMount () {
    let { dispatch, slug, community } = this.props
    if (get(community, 'beta_access_code')) return
    dispatch(fetchCommunitySettings(slug))
  }

  render () {
    const { onCancel, tagName, community, dispatch, pending,
      tagInvitationEditor: { recipients, error, success } } = this.props
    const joinUrl = get(community, 'beta_access_code')
      ? communityTagJoinUrl(community, tagName)
      : null

    const setError = text => dispatch(updateTagInvitationEditor('error', text))

    const update = (field) => event =>
      dispatch(updateTagInvitationEditor(field, event.target.value))

    const submit = () => {
      setError(null)

      let emails = parseEmailString(recipients)
      if (isEmpty(emails)) return setError('Enter at least one email address.')

      let badEmails = emails.filter(email => !validator.isEmail(email))
      if (some(badEmails)) return setError(`These emails are invalid: ${badEmails.join(', ')}`)

      dispatch(sendCommunityTagInvitation(community.id, tagName, {emails}))
    }

    return <Modal title={`Invite friends to join ${community.name} and follow #${tagName}`} id='share-topic' onCancel={onCancel}>
      <div className='join-url'>
        <label>Friends with this link can join</label>
        {joinUrl ? <A to={joinUrl}>{joinUrl}</A> : <span>Loading...</span>}
      </div>
      <div className='invite'>
        <label>Invite friends via email</label>
        <input type='text'
          placeholder='Enter email addresses, separated by commas'
          value={recipients}
          onChange={update('recipients')}/>
      </div>
      {error && <div className='alert alert-danger'>{error}</div>}
      {success && <div className='alert alert-success'>{success}</div>}
      <div className='footer'>
        <button onClick={() => dispatch(closeModal())}>Done</button>
        <button onClick={submit} className={cx({ok: !pending})}>
          {pending ? 'Sending...' : 'Invite'}
        </button>
      </div>
    </Modal>
  }
}
