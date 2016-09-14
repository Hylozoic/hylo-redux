import React from 'react'
import { humanDate } from '../../util/text'
import A from '../../components/A'
import Avatar from '../../components/Avatar'
import ScrollListener from '../../components/ScrollListener'
import { FETCH_INVITATIONS, fetchInvitations } from '../../actions'
import cx from 'classnames'
import { get } from 'lodash'
import { connect } from 'react-redux'

const InvitationList = connect((state, { id }) => ({
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
              ? <td className='person'>
                  <Avatar person={person}/>
                  <A to={`/u/${person.id}`}>{person.name}</A>
                </td>
              : <td className='unused'>unused</td>}
            <td>{humanDate(invitation.created)}</td>
          </tr>
        })}
      </tbody>
    </table>
    <ScrollListener onBottom={loadMore}/>
    {offset >= total && <p className='summary'>
      {total} invitations sent, {invitations.filter(i => i.user).length} used
    </p>}
  </div>
})

export default InvitationList
