import React from 'react'
const { func } = React.PropTypes

export default class RefreshButton extends React.Component {
  static propTypes = {
    refresh: func
  }
  componentDidMount () {
    window.addEventListener('scroll', this.handleScrollEvents)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.handleScrollEvents)
  }

  render () {
    let { refresh } = this.props
    return <div className='refresh-button static'>New Posts are available. <a onClick={refresh}>Refresh</a></div>
  }
}
