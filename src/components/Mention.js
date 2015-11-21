// See comments in MentionController.js.

import React from 'react'
import {isEmpty} from 'lodash'
import KeyControlledList from './KeyControlledList'
var {array, bool, func, string} = React.PropTypes

// @connectToStores([MentionStore], (context, props) => {
//   var store = context.getStore(MentionStore)
//   var cursor = store.editors[props.editorId] || {}
//   return {
//     fetching: cursor.fetching,
//     choices: cursor.choices || []
//   }
// })
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

    editorId: string
  }

  static contextTypes = {
    executeAction: func
  }

  componentDidMount () {
    this.controller = this.controller || new MentionController(this)
  }

  select = (choice, event) => {
    this.controller.addMention(this.props.template(choice))
  }

  query = term => {
    this.context.executeAction(queryMentions, {id: this.props.editorId, query: term})
  }

  resetQuery = () => {
    this.context.executeAction(c => c.dispatch('RESET_MENTIONS', this.props.editorId))
  }

  handleKeys = event => {
    this.refs.list.handleKeys(event)
  }

  render () {
    var {choices} = this.props

    return <div className='dropdown mentions'>
      {!isEmpty(choices) && <KeyControlledList className='dropdown-menu'
        ref='list' items={choices} onChange={this.select}/>}
    </div>
  }
}
