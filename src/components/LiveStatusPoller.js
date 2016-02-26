import React from 'react'
import { connect } from 'react-redux'
import { fetchLiveStatus } from '../actions'
const { func } = React.PropTypes

@connect()
export default class LiveStatusPoller extends React.Component {

  static propTypes = {
    dispatch: func
  }

  componentDidMount () {
    /*
    let { dispatch } = this.props
    dispatch(fetchLiveStatus())
    setInterval(() => dispatch(fetchLiveStatus()),
      30 * 1000)
    */
  }

  render () {
    return <span />
  }
}
