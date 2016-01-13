import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetchActivity } from '../actions'

@connect()
@prefetch(({ dispatch, params, currentUser: { id } }) => dispatch(fetchActivity(50)))
export default class Notifications extends React.Component {
  render () {
    return <div>
      <h2>Notifications</h2>
    </div>
  }
}
