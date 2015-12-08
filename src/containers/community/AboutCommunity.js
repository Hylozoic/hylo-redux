import React from 'react'
import { connect } from 'react-redux'
import { markdown } from '../../util/text'
const { object } = React.PropTypes

@connect((state, { params }) => ({community: state.communities[params.id]}))
export default class AboutCommunity extends React.Component {
  static propTypes = {
    community: object
  }

  render () {
    let { community } = this.props
    return <div className='markdown'
      dangerouslySetInnerHTML={{__html: markdown(community.description)}}/>
  }
}
