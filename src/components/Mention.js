// See comments in MentionController.js.

import React from 'react'
import {isEmpty} from 'lodash'
import KeyControlledList from './KeyControlledList'
import MentionController from '../client/MentionController'
var {array, bool, func, string} = React.PropTypes

export default class Mention extends React.Component {

  static propTypes = {
    fetching: bool,

    // choices for autocompleting the @-mention that is being typed.
    options: array,

    // what HTML should be added to the editor when an item is selected.
    // takes one argument, the item.
    template: func,

    // a CSS selector so we know when to remove an @-mention when backspacing.
    mentionSelector: string,

    editorId: string,

    // the function to call when the text input changes.
    // takes one argument, the value of the text input.
    typeahead: func,

    // a function that takes a callback, which it calls with the tinymce editor
    // as the first argument.
    getEditor: func
  }

  componentDidMount () {
    this.props.getEditor(editor => {
      this.controller = new MentionController(this, editor)
    })
  }

  select = (choice) => {
    this.controller.addMention(this.props.template(choice))
  }

  handleKeys = event => {
    this.refs.list.handleKeys(event)
  }

  query = text => {
    return this.props.typeahead(text)
  }

  resetQuery = () => {
    return this.query(null)
  }

  render () {
    var { options } = this.props

    return <div className='dropdown mentions'>
      {!isEmpty(options) && <KeyControlledList className='dropdown-menu'
        ref='list' items={options} onChange={this.select}/>}
    </div>
  }
}
