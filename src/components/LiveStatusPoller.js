import React from 'react'
import { connect } from 'react-redux'
import { fetchLiveStatus, getUserBalance } from '../actions'
import { get } from 'lodash'
const { func, object } = React.PropTypes

@connect()
export default class LiveStatusPoller extends React.Component {

  static propTypes = {
    dispatch: func,
    community: object,
    balance: object
  }

  setPollInterval (community, balance) {
    let { dispatch } = this.props

    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }

    this.pollInterval = setInterval(() =>
      dispatch(fetchLiveStatus(get(community, 'id'), get(community, 'slug'))).then( () => {balance = dispatch(getUserBalance(get(balance, 'balance')))}),
      60 * 500)

  }

  componentDidMount () {
    let { dispatch, community, balance } = this.props
    setTimeout(() => dispatch(fetchLiveStatus(get(community, 'id'), get(community, 'slug'))).then( () => {balance = dispatch(getUserBalance(get(balance, 'balance')))}), 10 * 1000)
    this.setPollInterval(community, balance)
  }

  componentWillReceiveProps (nextProps) {
    if (get(nextProps, 'community.id') !== get(this.props, 'community.id')) {
      this.setPollInterval(nextProps.community, nextProps.balance)
    }
  }

  componentWillUnmount () {
    clearInterval(this.intervalId)
  }

  render () {
    return null
  }
}
