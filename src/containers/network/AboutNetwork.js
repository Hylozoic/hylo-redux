import React from 'react'
import { connect } from 'react-redux'
import { markdown } from 'hylo-utils/text'
const { object } = React.PropTypes

const AboutNetwork = connect((state, { params }) => ({network: state.networks[params.id]}))(props => {
  let { network } = props
  return <div id='about-community' className='markdown'
    dangerouslySetInnerHTML={{__html: markdown(network.description)}} />
})

AboutNetwork.propTypes = {
  network: object
}

export default AboutNetwork
