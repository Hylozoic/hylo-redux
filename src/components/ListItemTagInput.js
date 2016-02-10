import React from 'react'
import { get } from 'lodash'
import { connect } from 'react-redux'
import TagInput from './TagInput'
import { typeahead } from '../actions'
const { func, object, string } = React.PropTypes

const ListItemTagInput = connect(
  ({ typeaheadMatches }, { type }) => ({matches: get(typeaheadMatches, type)})
)(({ dispatch, matches, type, person, update }) => {
  let list = person[type] || []
  let tags = list.map(x => ({id: x, name: x}))
  let add = item => update(type, list.concat(item.name))
  let remove = item => update(type, list.filter(x => x !== item.name))

  return <TagInput
    choices={matches}
    tags={tags}
    allowNewTags={true}
    handleInput={value => dispatch(typeahead(value, type, {type}))}
    onSelect={add}
    onRemove={remove}/>
})

ListItemTagInput.propTypes = {
  type: string.isRequired,
  person: object.isRequired,
  update: func.isRequired
}

export default ListItemTagInput
