import React from 'react'
import { connect } from 'react-redux'
import { typeahead } from '../actions'
import { isEmpty } from 'lodash'
import KeyControlledList from './KeyControlledList'
var {array, func, string} = React.PropTypes

@connect((state, props) => ({ choices: state.typeaheadMatches[props.typeaheadId] }))
export default class PersonChooser extends React.Component {

  static propTypes = {
    communityId: string,
    typeaheadId: string,
    onSelect: func,
    dispatch: func,
    choices: array
  }

  constructor (props) {
    super(props)
    this.state = {choices: []}
  }

  handleInput = event => {
    var value = event.target.value
    let { dispatch, typeaheadId, communityId } = this.props
    dispatch(typeahead(value, typeaheadId, communityId))
    this.setState({choices: this.props.choices})
  }

  handleKeys = event => {
    if (this.refs.list) this.refs.list.handleKeys(event)
  }

  select = choice => {
    let { onSelect } = this.props
    onSelect(choice)
    this.refs.input.value = ''
    this.handleInput({target: {value: ''}})
  }

  render () {
    let { choices } = this.props
    return <div className='chooser'>
      <input className='form-control' ref='input' type='text' placeholder='Type...'
        onChange={this.handleInput}
        onKeyDown={this.handleKeys}/>

      {!isEmpty(choices) && <div className='dropdown active'>
        <KeyControlledList className='dropdown-menu' ref='list' items={choices} onChange={this.select}/>
      </div>}
    </div>
  }
}
