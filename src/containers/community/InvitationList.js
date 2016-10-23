import React from 'react'
import { humanDate } from '../../util/text'
import A from '../../components/A'
import Avatar from '../../components/Avatar'
import { FETCH_INVITATIONS, fetchInvitations } from '../../actions'
import cx from 'classnames'
import { get } from 'lodash'
import { connect } from 'react-redux'

const InvitationList = connect((state, { id }) => ({
  invitations: state.invitations[id],
  total: state.totalInvitations[id],
  pending: state.pending[FETCH_INVITATIONS]
}))(props => {
  const { invitations, pending, total, dispatch, id } = props
  const offset = get(invitations, 'length') || 0

  const loadMore = () =>
    !pending && offset < total && dispatch(fetchInvitations(id, offset))

  const countText = offset < total
    ? `showing ${invitations.length} of ${total} invitations, ${invitations.filter(i => i.user).length} used`
    : `${total} invitations sent, ${invitations.filter(i => i.user).length} used`

  const resendAll = () => console.log('resending all')
  const sendInvitation = email => console.log('sendInvitation to', email)

  return <div className='invitations'>
    <label>Pending Invitations <span className='count'>{countText}</span></label>
    <p className='summary'>These are people you have already sent invitations to.</p>
    <a className='resend-all' onClick={resendAll}>Resend All</a>
    <div className='person-table'>
      <table>
        <thead>
          <tr>
            <th>Recipient</th>
            <th>Used by</th>
            <th>Time sent</th>
            <th>Resend</th>
          </tr>
        </thead>
        <tbody>
          {(invitations || []).map((invitation, index) => {
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
