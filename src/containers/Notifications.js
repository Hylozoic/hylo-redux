import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetchActivity, markAllActivitiesRead } from '../actions'
import { values, sortBy } from 'lodash'
import cx from 'classnames'
import ScrollListener from '../components/ScrollListener'
const { array, bool, func, number } = React.PropTypes

@prefetch(({ dispatch }) => dispatch(fetchActivity(5, 0)))
@connect(state => ({
  activities: sortBy(values(state.activities), ['created_at']).reverse(),
  total: Number(state.totalActivities)
}))
export default class Notifications extends React.Component {

  static propTypes = {
    activities: array,
    pending: bool,
    dispatch: func,
    total: number
  }

  loadMore = () => {
    let { total, activities, dispatch, pending } = this.props
    let offset = activities.length
    if (!pending && offset < total) {
      dispatch(fetchActivity(5, offset))
    }
  }

  markAllRead = () => {
    let { dispatch } = this.props
    dispatch(markAllActivitiesRead())
  }

  render () {
    let { activities, total, pending } = this.props

    return <div>
      <h2>Notifications</h2>
      <p>Activities length: {activities.length}</p>
      <p>total: {total}</p>
      <p>pending: {pending}</p>
      <div className='activities'>
        <div className='buttons'>
          <button onClick={this.markAllRead}>
            Mark all as read
          </button>
        </div>
        {activities.map(activity => <div key={activity.id} className={cx('activity', {'unread': activity.unread})}>
          ID: {activity.id} <br />
        </div>)}
        <ScrollListener onBottom={this.loadMore}/>
      </div>
    </div>
  }
}
