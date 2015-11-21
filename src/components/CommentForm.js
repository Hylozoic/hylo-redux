import React from 'react'
var { func, string } = React.PropTypes
import RichTextEditor from './RichTextEditor'

export default class CommentForm extends React.Component {
  static propTypes = {
    postId: string
  }

  static contextTypes = {
    executeAction: func
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
    let {postId} = this.props
    let text = this.state.input
    this.context.executeAction(createComment, {postId, text})
    this.setState({input: ''})
    this.refs.editor.setContent('')
  }

  mentionTemplate = user => {
    return <a data-user-id={user.id} href={'/u/' + user.id}>{user.name}</a>
  }

  render () {
    return <form onSubmit={this.submit} className='comment-form'>
      <RichTextEditor ref='editor'
        content={this.state.input}
        onChange={this.handleChange}
        template={this.mentionTemplate}
        mentionSelector='[data-user-id]'/>
      <input type='submit' value='Send'/>
    </form>
  }
}
