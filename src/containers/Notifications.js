import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetchActivity } from '../actions'
import { values, sortBy } from 'lodash'
const { array, bool, func, number } = React.PropTypes

@prefetch(({ dispatch }) => dispatch(fetchActivity(5, 0)))
@connect(state => ({ activities: sortBy(values(state.activities), ['created_at']).reverse() }))
export default class Notifications extends React.Component {

  static propTypes = {
    activities: array,
    pending: bool,
    dispatch: func,
    total: number
  }

  loadMore = () => {
    let { activities, dispatch, pending } = this.props
    let total = 20
    let offset = activities.length
    if (!pending && offset < total) {
      dispatch(fetchActivity(5, offset))
    }
  }

  render () {
    let { activities, total, pending } = this.props

    return <div>
      <h2>Notifications</h2>
      <p>Activities length: {activities.length}</p>
      <p>total: {total}</p>
      <p>pending: {pending}</p>
      <div className='activities'>
        {activities.map(activity => <div key={activity.id} className='activity'>
          <span>ID: {activity.id}</span>
        </div>)}
      </div>
    </div>
  }
}
