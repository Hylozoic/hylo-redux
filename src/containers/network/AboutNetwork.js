import React from 'react'
import { connect } from 'react-redux'
import { markdown } from '../../util/text'
const { object } = React.PropTypes

@connect((state, { params }) => ({network: state.networks[params.id]}))
export default class AboutNetworks extends React.Component {
  static propTypes = {
    network: object
  }

  render () {
    let { network } = this.props
    return <div className='markdown description'
      dangerouslySetInnerHTML={{__html: markdown(network.description)}}/>
  }
}
