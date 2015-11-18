import React from 'react'
import { Link, IndexLink } from 'react-router'
import { connect } from 'react-redux'

const increment = function () {
  return {
    type: 'INCREMENT',
    payload: {
      hello: 'world'
    }
  }
}

@connect(state => state)
export default class App extends React.Component {
  static propTypes = {
    children: React.PropTypes.object,
    count: React.PropTypes.number
  }

  render () {
    return <div>
      <h1>Hello</h1>
      <IndexLink to='/'>Home</IndexLink>&nbsp;
      <Link to='/about'>About</Link>
      <p>counter is {this.props.count}</p>
      <button onClick={() => this.props.dispatch(increment())}>+1</button>
      {this.props.children}
    </div>
  }
}
