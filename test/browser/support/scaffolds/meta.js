import React from 'react'
import { render } from 'react-dom'

class TestComponent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    this.setState({message: `I am a ${process.env.THING}, hear me roar!`})
  }

  render () {
    return <span>{this.state.message || 'Huh?'}</span>
  }
}

render(<TestComponent/>, document.getElementById('root'))
