import React from 'react'
import RichTextEditor from './RichTextEditor'
import { connect } from 'react-redux'
import { typeahead } from '../actions'
var { array, func } = React.PropTypes

@connect(state => ({mentionChoices: state.typeaheadMatches.comment}))
export default class CommentForm extends React.Component {
  static propTypes = {
    onCreate: func,
    mentionChoices: array,
    mentionTypeahead: func,
    dispatch: func
  }

  constructor (props) {
    super(props)
    this.state = {input: ''}
  }

  handleChange = event => {
    this.setState({input: event.target.value})
  }

  submit = event => {
    event.preventDefault()
    this.props.onCreate(this.state.input)
    this.setState({input: ''})
    this.refs.editor.setContent('')
  }

  mentionTemplate = person => {
    return <a data-user-id={person.id} href={'/u/' + person.id}>{person.name}</a>
  }

  mentionTypeahead = text => {
    if (text) {
      this.props.dispatch(typeahead({text: text, context: 'comment'}))
    } else {
      this.props.dispatch(typeahead({cancel: true, context: 'comment'}))
    }
  }

  render () {
    return <form onSubmit={this.submit} className='comment-form'>
      <RichTextEditor ref='editor'
        content={this.state.input}
        onChange={this.handleChange}
        mentionTemplate={this.mentionTemplate}
        mentionTypeahead={this.mentionTypeahead}
        mentionChoices={this.props.mentionChoices}
        mentionSelector='[data-user-id]'/>
      <input type='submit' value='Send'/>
    </form>
  }
}
