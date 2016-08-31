import React from 'react'
import { connect } from 'react-redux'
import validator from 'validator'
import {
  closeModal, fetchCommunitySettings, updateTagInvitationEditor, sendCommunityTagInvitation,
  SEND_COMMUNITY_TAG_INVITATION
} from '../actions'
import { Modal } from '../components/Modal'
import ModalRow from '../components/ModalRow'
import { communityTagJoinUrl } from '../routes'
import { parseEmailString } from '../util/text'
import { get, isEmpty, some } from 'lodash'
import cx from 'classnames'
const { func, string, object, bool, array } = React.PropTypes

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

  constructor (props) {
    super(props)
    this.state = {
      copied: false
    }
  }

  componentDidMount () {
    let { dispatch, slug, community } = this.props
    if (get(community, 'beta_access_code')) return
    dispatch(fetchCommunitySettings(slug))
  }

  render () {
    const { onCancel, tagName, community, dispatch, pending,
      tagInvitationEditor: { recipients, error, success } } = this.props

    const { copied } = this.state

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

    const copyLink = joinUrl
      ? () => {
        console.log(joinUrl)
        this.setState({copied: true})
      }
      : false

    return <Modal title={`Invite people to join ${tagName}`} id='invite-topic'
      onCancel={onCancel}>
      <div className='join-url'>
        Anyone with this link can join.
        {copyLink
          ? <span>
              <a onClick={copyLink}> Copy Link</a>
              {copied && <span className='copied'> (copied)</span>}
            </span>
          : <span> Loading...</span>}
      </div>
      <HybridInviteInput recipients={recipients} update={update}/>
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

class HybridInviteInput extends React.Component {

  static propTypes = {
    recipients: array,
    update: func
  }

  render () {
    const { recipients, update } = this.props

    const onFocus = () => this.refs.row.focus()
    const onBlur = () => this.refs.row.blur()
    return <ModalRow ref='row' field={this.refs.input}>
      <input type='textarea'
        ref='input'
        onFocus={onFocus}
        onBlur={onBlur}
        value={recipients}
        onChange={update('recipients')}/>
    </ModalRow>
  }
}
