import React from 'react'
import { humanDate } from '../../util/text'
import A from '../../components/A'
import Avatar from '../../components/Avatar'
import {
  FETCH_JOIN_REQUESTS, approveJoinRequest, approveAllJoinRequests, notify
} from '../../actions'
import cx from 'classnames'
import { connect } from 'react-redux'

const JoinRequestList = connect((state, { id }) => ({
  joinRequests: state.joinRequests[id],
  total: state.totaljoinRequests[id],
  pending: state.pending[FETCH_JOIN_REQUESTS]
}))(props => {
  let { joinRequests, total, dispatch, id } = props

  const approve = userId =>
    dispatch(approveJoinRequest(userId, id))
    .then(({ error }) => {
      if (error) {
        dispatch(notify('There was a problem approving this request; please try again later.', {type: 'error'}))
      } else {
        dispatch(notify('Request approved.'))
      }
    })

  const approveAll = () =>
    dispatch(approveAllJoinRequests(id))
    .then(({ error }) => {
      if (error) {
        dispatch(notify('There was a approving these requests; please try again later.', {type: 'error'}))
      } else {
        dispatch(notify('All requests approved'))
      }
    })

  return <div className='join-requests'>
    <a name='join_requests'/>
    <div className='join-requests-header'>
      <label>Requests<span className='count'>{total}</span></label>
      <p className='summary'>These are people who have asked to join.</p>
      <a className='approve-all' onClick={approveAll}>Approve All</a>
    </div>
    <div className='person-table'>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Time Requested</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {(joinRequests || []).map((joinRequest, index) => {
            let person = joinRequest.user
            return <tr key={joinRequest.id} className={cx({even: index % 2 === 0})}>
              <td className='person'>
                <Avatar person={person}/>
                <A to={`/u/${person.id}?check-join-requests=1`}>{person.name}</A>
              </td>
              <td>{humanDate(joinRequest.updated_at || joinRequest.created_at)}</td>
              <td><a className='table-button' onClick={() => approve(person.id)}>Approve</a></td>
            </tr>
          })}
        </tbody>
      </table>
    </div>
  </div>
})

export default JoinRequestList
