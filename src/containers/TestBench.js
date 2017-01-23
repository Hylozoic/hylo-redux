import React from 'react'
import RichTextEditor from '../components/RichTextEditor'

export default class TestBench extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  handleChange = event => {
    const editorText = event.target.value.replace(/(<p>&nbsp;<\/p>\n?)+$/g, '')
    this.setState({editorText})
  }

  render () {
    return <div style={{padding: 30, minHeight: '100vh'}}>
      <h2 style={{marginTop: 0}}>Test bench</h2>
      <RichTextEditor name='test' onChange={this.handleChange} />
      <pre style={{marginTop: 10}}>{this.state.editorText}</pre>
    </div>
  }
}
