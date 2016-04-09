import React from 'react'
import { connect } from 'react-redux'
import { find } from 'lodash'
import TagInput from './TagInput'
var { array } = React.PropTypes

@connect(({ communities }, { ids }) => ({
  communities: (ids || []).map(id => find(communities, c => c.id === id))
}))
export default class CommunityTagInput extends React.Component {
  static propTypes = {
    ids: array,
    communities: array,
    choices: array
  }

  render () {
    let { communities, ...otherProps } = this.props
    return <TagInput tags={communities} placeholder='Community name...' {...otherProps}/>
  }
}
