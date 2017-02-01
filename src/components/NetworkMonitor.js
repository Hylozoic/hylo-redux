import React from 'react'
import { connect } from 'react-redux'
import { notify, removeNotification } from '../actions'
import { fetchJSON } from '../util/api'

@connect(() => ({}), {notify, removeNotification})
export default class NetworkMonitor extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return null
  }

  componentWillUnmount () {
    clearInterval(this.interval)
  }

  componentDidMount () {
    this.visibility = require('visibility')()
    this.interval = setInterval(() => {
      if (!this.visibility.visible()) return

      fetchJSON('/noo/user/status')
      .then(() => {
        if (this.state.offline) {
          this.props.removeNotification('offline')
          this.setState({offline: false})
        }
      })
      .catch(() => {
        if (this.state.offline) return

        this.props.notify(
          'You seem to be offline. Please wait while we try to connect...',
          {
            noClose: true,
            type: 'warning',
            maxage: null,
            singleton: true,
            id: 'offline'
          }
        )

        this.setState({offline: true})
      })
    }, 5000)
  }
}
