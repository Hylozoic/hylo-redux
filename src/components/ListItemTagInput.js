import React, { Component, PropTypes } from 'react'
import { get } from 'lodash'
import { connect } from 'react-redux'
import TagInput from './TagInput'
import { typeahead } from '../actions'
import { trackEvent, ADDED_SKILL } from '../util/analytics'

class ListItemTagInput extends Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    person: PropTypes.object.isRequired,
    update: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {
      list: props.person[props.type] || []
    }
  }

  handleInput = (value) => {
    const { dispatch, type } = this.props
    return dispatch(typeahead(value, type, {type}))
  }

  add = (item) => {
    const { update, context, type } = this.props
    const { list } = this.state
    const updatedList = [...list, item.name]
    trackEvent(ADDED_SKILL, {context, tag: item.name})
    this.setState({ list: updatedList })
    return update(type, updatedList)
  }

  remove = (item) => {
    const { update, type } = this.props
    const { list } = this.state
    const updatedList = list.filter(x => x !== item.name)
    this.setState({ list: updatedList })
    return update(type, updatedList)
  }

  collectTags = () => {
    const { type } = this.props
    const { list } = this.state
    return list.map(x => ({
      id: x,
      name: x,
      label: type === 'tags' ? '#' + x : x
    }))
  }

  render () {
    const { handleInput, add, remove, collectTags } = this
    const { matches, filter, className } = this.props
    const tags = collectTags()
    return <TagInput
      choices={matches}
      tags={tags}
      allowNewTags
      handleInput={handleInput}
      onSelect={add}
      onRemove={remove}
      className={className}
      filter={filter} />
  }
}

const mapStateToProps = ({ typeaheadMatches }, { type }) => {
  return {
    matches: get(typeaheadMatches, type)
  }
}

export default connect(mapStateToProps)(ListItemTagInput)
