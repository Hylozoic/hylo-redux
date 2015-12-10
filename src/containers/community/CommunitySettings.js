import React from 'react'
import { connect } from 'react-redux'
const { object } = React.PropTypes

@connect((state, { params }) => ({community: state.communities[params.id]}))
export default class CommunitySettings extends React.Component {
  static propTypes = {
    community: object
  }

  render () {
    let { community } = this.props

    return <div>Community Settings for {community.name}</div>
  }
}
