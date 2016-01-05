import React from 'react'
import { connect } from 'react-redux'
import { navigate } from '../actions'
const { func } = React.PropTypes

@connect()
export default class ClickCatchingDiv extends React.Component {
  static propTypes = {
    dispatch: func
  }

  handleClick = event => {
    var node = event.target
    if (node.nodeName.toLowerCase() !== 'a') return

    if (node.getAttribute('data-user-id') || node.getAttribute('data-search')) {
      event.preventDefault()
      this.props.dispatch(navigate(node.getAttribute('href')))
      return
    }
  }

  render () {
    return <div {...this.props} onClick={this.handleClick}></div>
  }
}
