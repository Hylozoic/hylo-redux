import React from 'react'
import RichTextEditor from './RichTextEditor'
import { connect } from 'react-redux'
import { typeahead } from '../actions'
import { personTemplate } from '../util/mentions'
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

  render () {
    let { dispatch } = this.props

    return <form onSubmit={this.submit} className='comment-form'>
      <RichTextEditor ref='editor'
        content={this.state.input}
        onChange={this.handleChange}
        mentionTemplate={personTemplate}
        mentionTypeahead={text => dispatch(typeahead(text, 'comment'))}
        mentionChoices={this.props.mentionChoices}
        mentionSelector='[data-user-id]'/>
      <input type='submit' value='Comment'/>
    </form>
  }
}
