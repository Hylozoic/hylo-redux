import React from 'react'
import { connect } from 'react-redux'
import { typeahead } from '../actions'
import { isEmpty } from 'lodash'
import { KeyControlledItemList } from './KeyControlledList'
var {array, func, string} = React.PropTypes

@connect((state, props) => ({ choices: state.typeaheadMatches[props.typeaheadId] }))
export default class PersonChooser extends React.Component {

  static propTypes = {
    placeholder: string,
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
    dispatch(typeahead(value, typeaheadId, {communityId, type: 'people'}))
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
    let { choices, placeholder } = this.props
    return <div className='chooser'>
      <input className='form-control' ref='input' type='text' placeholder={ placeholder || 'Type...' }
        onChange={this.handleInput}
        onKeyDown={this.handleKeys}/>

      {!isEmpty(choices) && <div className='dropdown active'>
        <KeyControlledItemList className='dropdown-menu' ref='list' items={choices} onChange={this.select}/>
      </div>}
    </div>
  }
}
