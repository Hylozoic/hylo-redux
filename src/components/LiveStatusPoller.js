import React from 'react'
import { connect } from 'react-redux'
import { fetchLiveStatus } from '../actions'
import { get } from 'lodash'
const { func, object } = React.PropTypes

@connect()
export default class LiveStatusPoller extends React.Component {

  static propTypes = {
    dispatch: func,
    community: object
  }

  setPollInterval (community) {
    let { dispatch } = this.props

    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }

    this.pollInterval = setInterval(() =>
      dispatch(fetchLiveStatus(get(community, 'id'), get(community, 'slug'))),
      60 * 1000)
  }

  componentDidMount () {
    let { dispatch, community } = this.props
    setTimeout(() => dispatch(fetchLiveStatus(community)), 10 * 1000)
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
