import React from 'react'
import { connect } from 'react-redux'
import { fetchLiveStatus } from '../actions'
const { func, string } = React.PropTypes

@connect()
export default class LiveStatusPoller extends React.Component {

  static propTypes = {
    dispatch: func,
    communityId: string
  }

  setPollInterval (communityId) {
    let { dispatch } = this.props

    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }

    this.pollInterval = setInterval(() => dispatch(fetchLiveStatus(communityId)),
      6 * 1000)
  }

  componentDidMount () {
    let { dispatch, communityId } = this.props
    dispatch(fetchLiveStatus(communityId))
    this.setPollInterval(communityId)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.communityId !== this.props.communityId) {
      this.setPollInterval(nextProps.communityId)
    }
  }

  componentWillUnmount () {
    clearInterval(this.intervalId)
  }

  render () {
    return null
  }
}
