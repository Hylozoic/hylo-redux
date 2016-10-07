import React from 'react'
import { humanDate } from '../../util/text'
import A from '../../components/A'
import Avatar from '../../components/Avatar'
import ScrollListener from '../../components/ScrollListener'
import { FETCH_JOIN_REQUESTS, fetchJoinRequests, approveJoinRequest } from '../../actions'
import cx from 'classnames'
import { get } from 'lodash'
import { connect } from 'react-redux'

const JoinRequestList = connect((state, { id }) => ({
  joinRequests: state.joinRequests[id],
  total: state.totaljoinRequests[id],
  pending: state.pending[FETCH_JOIN_REQUESTS]
}))(props => {
  let { joinRequests, pending, total, dispatch, id } = props
  let offset = get(joinRequests, 'length') || 0

  const loadMore = () =>
    !pending && offset < total && dispatch(fetchJoinRequests(id, offset))

  const approve = userId =>
    dispatch(approveJoinRequest(userId, id))

  return <div className='person-table'>
    <table>
      <thead>
        <tr>
          <th>User</th>
          <th>Time Requested</th>
          <th>Approve</th>
        </tr>
      </thead>
      <tbody>
        {(joinRequests || []).map((joinRequest, index) => {
          let person = joinRequest.user
          return <tr key={joinRequest.id} className={cx({even: index % 2 === 0})}>
            <td className='person'>
              <Avatar person={person}/>
              <A to={`/u/${person.id}`}>{person.name}</A>
            </td>
            <td>{humanDate(joinRequest.updated_at || joinRequest.created_at)}</td>
            <td><button onClick={() => approve(person.id)}>Approve</button></td>
          </tr>
        })}
      </tbody>
    </table>
    <ScrollListener onBottom={loadMore}/>
    {offset >= total && <p className='summary'>
      {total} pending requests to join.
    </p>}
  </div>
})

export default JoinRequestList
