import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
const { object } = React.PropTypes

export default class ProjectContributors extends React.Component {
  static propTypes = {
    project: object,
    children: object
  }

  render () {
    return <div>Project contributors</div>
  }
}
