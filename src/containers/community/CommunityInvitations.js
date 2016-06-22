import React from 'react'
import { compose } from 'redux'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import {
  FETCH_INVITATIONS,
  SEND_COMMUNITY_INVITATION,
  fetchCommunity,
  fetchCommunitySettings,
  fetchInvitations,
  sendCommunityInvitation,
  updateInvitationEditor
} from '../../actions'
import { humanDate } from '../../util/text'
import A from '../../components/A'
import Avatar from '../../components/Avatar'
import ScrollListener from '../../components/ScrollListener'
import validator from 'validator'
import { some, get, isEmpty } from 'lodash'
import cx from 'classnames'
import { canInvite } from '../../models/currentUser'
import { INVITED_COMMUNITY_MEMBERS, trackEvent } from '../../util/analytics'
import { parseEmailString } from '../../util/text'

const defaultSubject = name =>
  `Join ${name} on Hylo`

const defaultMessage = name =>
  `${name} is using Hylo, a new kind of social network that's designed to help communities and organizations create things together.\n\n` +
  "We're surrounded by incredible people, skills, and resources. But it can be hard to know whom to connect with, for what, and when. Often the things we need most are closer than we think.\n\n" +
  'Hylo makes it easy to discover the abundant skills, resources, and opportunities in your communities that might otherwise go unnoticed. Together, we can create whatever we can imagine.'

const CommunityInvitations = compose(
  prefetch(({ params: { id }, dispatch }) => Promise.all([
    dispatch(fetchCommunity(id)),
    dispatch(fetchCommunitySettings(id)),
    dispatch(fetchInvitations(id))
  ])),
  connect(({ people, communities, invitationEditor, pending }, { params: { id } }) => ({
    community: communities[id],
    invitationEditor,
    pending: pending[SEND_COMMUNITY_INVITATION],
    currentUser: people.current
  }))
)(props => {
  let { currentUser, community, dispatch, invitationEditor, params: { id }, pending } = props
  if (!canInvite(currentUser, community)) {
    return <div>
      You don't have permission to view this page. <a href='javascript:history.go(-1)'>Back</a>
    </div>
  }
  let invitationUrl = `https://www.hylo.com/c/${community.slug}/join/${community.beta_access_code}`
  let { subject, message, recipients, moderator, error, success } = invitationEditor
  if (subject === undefined) subject = defaultSubject(community.name)
  if (message === undefined) message = defaultMessage(community.name)
  let setError = text => dispatch(updateInvitationEditor('error', text))

  let update = (field, toggle) => event => {
    let { value } = event.target
    if (toggle) value = !invitationEditor[field]
    dispatch(updateInvitationEditor(field, value))
  }

  let submit = () => {
    dispatch(updateInvitationEditor('results', null))
    setError(null)

    if (!subject) return setError('The subject may not be blank.')
    if (!message) return setError('The message may not be blank.')

    let emails = parseEmailString(recipients)
    if (isEmpty(emails)) return setError('Enter at least one email address.')

    let badEmails = emails.filter(email => !validator.isEmail(email))
    if (some(badEmails)) return setError(`These emails are invalid: ${badEmails.join(', ')}`)

    dispatch(sendCommunityInvitation(community.id, {subject, message, emails, moderator}))
    .then(({ error }) => {
      if (error) return
      dispatch(fetchInvitations(id, 0, true))
      trackEvent(INVITED_COMMUNITY_MEMBERS, {community})
    })
  }

  return <div className='form-sections'>
    <div className='section-label'>Share a code or link</div>
    <div className='section'>
      <div className='section-item'>
        <div className='half-column'>
          <label>
            Invitation code
            <div className='meta'>Anyone who knows this code can join this community.</div>
          </label>
          <p>{community.beta_access_code}</p>
        </div>
        <div className='half-column'>
          <label>
            Invitation code link
            <div className='meta'>Anyone can join this community using this link.</div>
          </label>
          <p><a href={invitationUrl}>{invitationUrl}</a></p>
        </div>
      </div>
    </div>

    <div className='section-label'>Send personalized invitations by email</div>
    <div className='section single-column'>
      <label>Subject</label>
      <input type='text' className='form-control' value={subject} onChange={update('subject')}/>

      <label>Message</label>
      <textarea className='form-control' value={message} onChange={update('message')}></textarea>

      <label>Recipients</label>
      <textarea className='form-control short' value={recipients} onChange={update('recipients')}
        placeholder='Enter email addresses, separated by commas or line breaks'></textarea>

      {error && <div className='alert alert-danger'>{error}</div>}
      {success && <div className='alert alert-success'>{success}</div>}
      <button className='right' onClick={submit}>
        {pending ? 'Sending...' : 'Send invitations'}
      </button>
      <label>
        <input type='checkbox' checked={moderator} onChange={update('moderator', true)}/>
        Invite recipients to be moderators
      </label>
    </div>

    <div className='section-label'>Sent invitations</div>
    <div className='section single-column sent-invitations'>
      <SentInvitationsList id={id}/>
    </div>
  </div>
})

const SentInvitationsList = connect((state, { id }) => ({
  invitations: state.invitations[id],
  total: state.totalInvitations[id],
  pending: state.pending[FETCH_INVITATIONS]
}))(props => {
  let { invitations, pending, total, dispatch, id } = props
  let offset = get(invitations, 'length') || 0

  let loadMore = () =>
    !pending && offset < total && dispatch(fetchInvitations(id, offset))

  return <div>
    <table>
      <thead>
        <tr>
          <th>Recipient</th>
          <th>Used by</th>
          <th>Time sent</th>
        </tr>
      </thead>
      <tbody>
        {(invitations || []).map((invitation, index) => {
          let person = invitation.user
          return <tr key={invitation.id} className={cx({even: index % 2 === 0})}>
            <td>{invitation.email}</td>
            {person
              ? <td>
                  <Avatar person={person}/>
                  <A to={`/u/${person.id}`}>{person.name}</A>
                </td>
              : <td className='unused'></td>}
            <td>{humanDate(invitation.created)}</td>
          </tr>
        })}
      </tbody>
    </table>
    <ScrollListener onBottom={loadMore}/>
    {offset >= total && <p className='footer meta right'>
      {total} invitations sent, {invitations.filter(i => i.user).length} used
    </p>}
  </div>
})

export default CommunityInvitations
