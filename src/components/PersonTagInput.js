import React from 'react'
import { connect } from 'react-redux'
import ModalRow from '../components/ModalRow'
import Avatar from '../components/Avatar'
import { KeyControlledItemList } from '../components/KeyControlledList'
import { getKeyCode, keyMap } from '../util/textInput'
import { compact, get, isEmpty, some } from 'lodash'
import { filter, includes, map, flow, curry } from 'lodash/fp'
import { typeahead } from '../actions'
import cx from 'classnames'

const { func, string, object, bool, array } = React.PropTypes

// A "just for example" - how to use this in Post
// (instead of TagInput for Completing a Request)
// 
// <PersonTagInput
//   people={requestCompletePeople}
//   choices={requestCompletePeopleChoices}
//   typeaheadId='invite'
//   addPerson={requestCompleteAddPerson}
//   removePerson={requestCompleteRemovePerson} />

@connect(({ typeaheadMatches }, { typeaheadId }) => ({
  choices: typeaheadMatches[typeaheadId]
}))
export default class PersonTagInput extends React.Component {

  static propTypes = {
    communityId: string,
    dispatch: func,
    people: array,
    addPerson: func,
    removePerson: func,
    choices: array,
    typeaheadId: string
  }

  handleInput = event => {
    var { value } = event.target
    const {
      dispatch, typeaheadId, communityId, addPerson
    } = this.props
    dispatch(typeahead(value, typeaheadId, {communityId, type: 'people'}))
    if (value.match(/,/)) {
      addPerson(flow(
        map(e => e.trim()),
        filter(e => !isEmpty(e))
      )(value.split(',')))
      this.refs.input.value = ''
    }
  }

  handleKeys = event => {
    if (this.refs.list) {
      this.refs.list.handleKeys(event)
    } else {
      const code = getKeyCode(event)
      if (code === keyMap.ENTER || code === keyMap.TAB) {
        this.handleInput({target: {value: this.refs.input.value + ','}})
      }
    }
  }

  select = choice => {
    let { addPerson } = this.props
    addPerson(choice)
    this.refs.input.value = ''
    this.handleInput({target: {value: ''}})
  }

  render () {
    const { people, removePerson, choices } = this.props

    const newChoices = filter(c => !includes(c.id, map('id', people)), choices)

    const Person = ({ person }) => {
      if (person.id) {
        return <span className='person'>
          <Avatar person={person}/>
          {person.name} <a className='remove'
            onClick={() => removePerson(person)}>&times;</a>
        </span>
      } else {
        return <span className='person'>
          {person} <a className='remove'
            onClick={() => removePerson(person)}>&times;</a>
        </span>
      }
    }

    const placeholder = isEmpty(people)
      ? 'Enter name or email to invite, use commas to separate.'
      : ''

    const onFocus = () => this.refs.row.focus()
    const onBlur = () => this.refs.row.blur()
    return <div className='person-tag-input' ref='row' field={this.refs.input}>
      <span className='people'>
        {people.map(r => <Person person={r} key={r.id || r}/>)}
      </span>
      <input type='text'
        className={cx({full: isEmpty(people)})}
        ref='input'
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={this.handleInput}
        onKeyDown={this.handleKeys}
        />
      {!isEmpty(newChoices) && <div className='dropdown active'>
        <KeyControlledItemList className='dropdown-menu' ref='list' items={newChoices} onChange={this.select}/>
      </div>}
    </div>
  }
}
