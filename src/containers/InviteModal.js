import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { get, some, isEmpty } from 'lodash/fp'
import validator from 'validator'
import {
  getCurrentCommunity, defaultInvitationSubject, defaultInvitationMessage
} from '../models/community'
import { canInvite } from '../models/currentUser'
import { closeModal } from '../actions'
import A from '../components/A'
import AccessErrorMessage from '../components/AccessErrorMessage'
import Icon from '../components/Icon'
import { Modal } from '../components/Modal'
import { ModalInput } from '../components/ModalRow'
import {
  updateInvitationEditor,
  sendCommunityInvitation,
  clearInvitationEditor,
  notify
} from '../actions'
import { fetchCommunity, updateCommunityChecklist } from '../actions/communities'
import { INVITED_COMMUNITY_MEMBERS, trackEvent } from '../util/analytics'
import { parseEmailString, emailsFromCSVFile } from '../util/text'
import { checklistUrl } from '../routes'
const { func, object, bool } = React.PropTypes

@prefetch(({ dispatch, params: { id } }) =>
  dispatch(fetchCommunity(id))
)
@connect((state, { community }) => ({
  community: community || getCurrentCommunity(state),
  invitationEditor: get('invitationEditor', state)
}))
export default class InviteModal extends React.Component {
  static propTypes = {
    dispatch: func,
    community: object,
    standalone: bool,
    onClose: func
  }

  render () {
    const {
      community, dispatch, standalone, onClose
    } = this.props

    const close = onClose || (() => dispatch(closeModal()))

    return <Modal title='Invite people to join you.'
      standalone={standalone}
      onCancel={close}>
      <InviteForm onClose={close} community={community} standalone={standalone}/>
    </Modal>
  }
}

@connect((state, { community }) => ({
  invitationEditor: get('invitationEditor', state)
}))
export class InviteForm extends React.Component {
  static propTypes = {
    dispatch: func,
    community: object,
    invitationEditor: object,
    onClose: func,
    standalone: bool,
    allowModerators: bool
  }

  static contextTypes = {
    currentUser: object
  }

  constructor (props) {
    super(props)
    this.state = {
      emails: '',
      expanded: false
    }
  }

  processCSV () {
    const { dispatch } = this.props

    const appendComma = string => {
      if (isEmpty(string) || string.trim().slice(-1) === ',') return string
      return string + ','
    }

    emailsFromCSVFile(this.refs.fileInput.files[0])
    .then(emails => {
      const textarea = this.refs.emails
      dispatch(updateInvitationEditor('recipients',
        appendComma(textarea.getValue()) + ' ' + emails.join(', ')))
    })
  }

  componentDidMount () {
    const { dispatch, community, invitationEditor } = this.props
    const { subject, message } = invitationEditor

    if (subject === undefined) {
      dispatch(updateInvitationEditor('subject', defaultInvitationSubject(community.name)))
    }
    if (message === undefined) {
      dispatch(updateInvitationEditor('message', defaultInvitationMessage(community.name)))
    }
  }

  render () {
    const { expanded } = this.state
    const {
      dispatch, invitationEditor, community, onClose, standalone, allowModerators
    } = this.props
    const { currentUser } = this.context

    if (!canInvite(currentUser, community)) {
      return <AccessErrorMessage error={{status: 403}}/>
    }

    let { subject, message, moderator, recipients, error } = invitationEditor

    let setError = text => dispatch(updateInvitationEditor('error', text))

    let update = (field, toggle) => event => {
      let { value } = event.target
      if (toggle) value = !invitationEditor[field]
      dispatch(updateInvitationEditor(field, value))
    }

    const clearEditor = () => {
      dispatch(clearInvitationEditor())
      dispatch(updateInvitationEditor('subject', defaultInvitationSubject(community.name)))
      dispatch(updateInvitationEditor('message', defaultInvitationMessage(community.name)))
    }

    let submit = () => {
      dispatch(updateInvitationEditor('results', null))
      setError(null)

      if (!subject) return setError('The subject may not be blank.')
      if (!message) return setError('The message may not be blank.')

      let emails = parseEmailString(recipients)
      if (isEmpty(emails)) return setError('Enter at least one email address.')

      let badEmails = emails.filter(email => !validator.isEmail(email))
      if (some(id => id, badEmails)) return setError(`These emails are invalid: ${badEmails.join(', ')}`)

      dispatch(sendCommunityInvitation(community.slug, {subject, message, emails, moderator}))
      .then(({ error }) => {
        if (error) return
        trackEvent(INVITED_COMMUNITY_MEMBERS, {community})
        clearEditor()
        dispatch(updateCommunityChecklist(community.slug))
        onClose && onClose()
        const clause = emails.length > 1 ? 's have' : ' has'
        dispatch(notify(`Your invitation${clause} been sent`))
        dispatch(updateInvitationEditor('recipients', ''))
      })
    }

    return <span id='community-invite-form'>
      <div className='modal-input csv-upload'>
        <label className='custom-file-upload'>
          <input type='file' onChange={() => this.processCSV()} ref='fileInput'/>
          Upload CSV
        </label>
        <label className='normal-label'>Import CSV File (optional)</label>
        <p className='help-text'>The file should have a header row named "email" for the email column. Or it can be a file in which each line is a single email address.</p>
      </div>
      <ModalInput
        className='emails'
        ref='emails'
        type='textarea'
        value={recipients}
        onChange={update('recipients')}
        prefix='To'
        placeholder='Emails (use commas to separate)'/>
        <div className='toggle-section'>
          <a onClick={() => this.setState({expanded: !expanded})}>
            Customize Message
            <Icon name={expanded ? 'Chevron-Up2' : 'Chevron-Down2'} />
          </a>
        </div>

      {expanded && <ModalInput
        label='Subject'
        ref='subject'
        value={subject}
        onChange={update('subject')}/>}
      {expanded && <ModalInput
        label='Message'
        ref='message'
        type='textarea'
        value={message}
        onChange={update('message')}/>}
      {error && <div className='alert alert-danger'>{error}</div>}
      <div className='footer'>
        <a className='button ok' onClick={submit}>Invite</a>
        {standalone && <A to={checklistUrl(community)} onClick={clearEditor} className='skip'>Skip</A>}
        {allowModerators && <span className='moderator'>
          <input type='checkbox' checked={moderator} onChange={update('moderator', true)}/>
          <span className='meta'>Check to invite these people to be moderators of the community.</span>
        </span>}
      </div>
    </span>
  }
}
