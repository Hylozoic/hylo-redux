import React from 'react'
import { connect } from 'react-redux'
import { markdown } from 'hylo-utils/text'
const { object } = React.PropTypes

@connect((state, { params }) => ({community: state.communities[params.id]}))
export default class AboutCommunity extends React.Component {
  static propTypes = {
    community: object
  }

  render () {
    let { community } = this.props
    return <div id='about-community' className='markdown'
      dangerouslySetInnerHTML={{__html: markdown(community.description)}}/>
  }
}
