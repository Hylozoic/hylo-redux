import React from 'react'
import { humanDate } from '../../util/text'
import A from '../../components/A'
import Avatar from '../../components/Avatar'
import {
  FETCH_INVITATIONS, fetchInvitations, sendCommunityInvitation, notify,
  resendAllCommunityInvitations
} from '../../actions'
import cx from 'classnames'
import { get, uniqBy } from 'lodash/fp'
import { connect } from 'react-redux'

const InvitationList = connect((state, { id }) => ({
  invitationEditor: get('invitationEditor', state),
  invitations: state.invitations[id],
  total: state.totalInvitations[id],
  pending: state.pending[FETCH_INVITATIONS]
}))(props => {
  const { invitations, pending, total, dispatch, id, invitationEditor } = props
  const offset = get('length', invitations) || 0

  const loadMore = () =>
    !pending && offset < total && dispatch(fetchInvitations(id, offset))

  const countText = offset < total
    ? `showing ${invitations.length} of ${total} invitations, ${invitations.filter(i => i.user).length} used`
    : `${total} invitations sent, ${invitations.filter(i => i.user).length} used`

  const { subject, message, moderator } = invitationEditor

  const resendAll = () =>
    dispatch(resendAllCommunityInvitations(id, {subject, message}))
    .then(({ error }) => {
      if (error) {
        dispatch(notify('There was a problem sending these invitations; please try again later.', {type: 'error'}))
      } else {
        dispatch(notify('Your invitations have been queued and will be sent shortly.'))
      }
    })
  const sendInvitation = email =>
    dispatch(sendCommunityInvitation(id, {subject, message, emails: [email], moderator}))
    .then(({ error }) => {
      if (error) {
        dispatch(notify('There was a problem sending this invitation; please try again later.', {type: 'error'}))
      } else {
        dispatch(notify(`Invitation sent to ${email}.`))
      }
    })
  return <div className='invitations'>
    <div className='invitations-header'>
      <label>Pending Invitations <span className='count'>{countText}</span></label>
      <p className='summary'>These are people you have already sent invitations to.</p>
      <a className='resend-all' onClick={resendAll}>Resend All</a>
    </div>
    <div className='person-table'>
      <table>
        <thead>
          <tr>
            <th>Recipient</th>
            <th>Used by</th>
            <th>Time sent</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {uniqBy('email', (invitations || [])).map((invitation, index) => {
            let person = invitation.user
            return <tr key={invitation.id} className={cx({even: index % 2 === 0})}>
              <td>{invitation.email}</td>
              {person
                ? <td className='person'>
                    <Avatar person={person}/>
                    <A to={`/u/${person.id}`}>{person.name}</A>
                  </td>
                : <td className='unused'>unused</td>}
              <td>{humanDate(invitation.created)}</td>
              <td><a className='table-button' onClick={() => sendInvitation(invitation.email)}>
                Resend
              </a></td>
            </tr>
          })}
          {offset < total && <tr><td /><td /><td />
            <td>
              <button onClick={loadMore}>Load More</button>
            </td>
          </tr>}
        </tbody>
      </table>
    </div>
  </div>
})

export default InvitationList
