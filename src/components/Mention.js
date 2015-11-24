// See comments in MentionController.js.

import React from 'react'
import {isEmpty} from 'lodash'
import KeyControlledList from './KeyControlledList'
import MentionController from './MentionController'
var {array, bool, func, string} = React.PropTypes

export default class Mention extends React.Component {

  static propTypes = {
    fetching: bool,

    // choices for autocompleting the @-mention that is being typed.
    choices: array,

    // what HTML should be added to the editor when an item is selected.
    // takes one argument, the item.
    template: func,

    // a CSS selector so we know when to remove an @-mention when backspacing.
    mentionSelector: string,

    editorId: string,

    // the function to call when the text input changes.
    // takes one argument, the value of the text input.
    typeahead: func
  }

  componentDidMount () {
    this.controller = this.controller || new MentionController(this)
  }

  select = (choice, event) => {
    this.controller.addMention(this.props.template(choice))
  }

  handleKeys = event => {
    this.refs.list.handleKeys(event)
  }

  query = text => {
    return this.props.typeahead(text)
  }

  resetQuery = () => {
    return this.props.typeahead(null)
  }

  render () {
    var { choices } = this.props

    return <div className='dropdown mentions'>
      {!isEmpty(choices) && <KeyControlledList className='dropdown-menu'
        ref='list' items={choices} onChange={this.select}/>}
    </div>
  }
}
