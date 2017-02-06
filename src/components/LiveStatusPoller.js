import React from 'react'
import { connect } from 'react-redux'
import { fetchLiveStatus, clearCache } from '../actions'
import { get } from 'lodash'
const { func, object } = React.PropTypes

@connect()
export default class LiveStatusPoller extends React.Component {

  static propTypes = {
    dispatch: func,
    community: object
  }

  fetchLiveStatus (community) {
    const { dispatch } = this.props

    dispatch(fetchLiveStatus(get(community, 'id'), get(community, 'slug')))
    .then(({ payload }) => {
      if (get(payload, 'new_notification_count') > 0) {
        dispatch(clearCache('activitiesByCommunity', 'all'))
      }
    })
  }

  setPollInterval (community) {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }

    this.pollInterval = setInterval(() =>
      this.fetchLiveStatus(community), 60 * 1000)
  }

  componentDidMount () {
    let { community } = this.props
    setTimeout(() => this.fetchLiveStatus(community), 60 * 1000)
    this.setPollInterval(community)
  }

  componentWillReceiveProps (nextProps) {
    if (get(nextProps, 'community.id') !== get(this.props, 'community.id')) {
      this.setPollInterval(nextProps.community)
    }
  }

  componentWillUnmount () {
    clearInterval(this.intervalId)
  }

  render () {
    return null
  }
}
