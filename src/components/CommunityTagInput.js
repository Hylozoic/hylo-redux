import React from 'react'
import { connect } from 'react-redux'
import { map } from 'lodash/fp'
import TagInput from './TagInput'
import { getCommunity } from '../models/community'
var { array } = React.PropTypes

@connect((state, { ids }) => ({
  communities: map(id => getCommunity(id, state), ids)
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
