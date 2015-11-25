import React from 'react'
import { connect } from 'react-redux'
import marked from 'marked'
const { object } = React.PropTypes

marked.setOptions({
  gfm: true,
  breaks: true,
  sanitize: true
})

@connect((state, { params }) => ({community: state.communities[params.id]}))
export default class AboutCommunity extends React.Component {
  static propTypes = {
    community: object
  }

  render () {
    let { community } = this.props
    return <div className='markdown'
      dangerouslySetInnerHTML={{__html: marked(community.description)}}/>
  }
}
