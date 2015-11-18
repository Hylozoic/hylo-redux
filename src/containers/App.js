import React from 'react'
import { Link, IndexLink } from 'react-router'
import { connect } from 'react-redux'
import TopNav from '../components/TopNav'
import { logout } from '../actions'

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
    let { currentUser } = this.props
    return <div>
      <div className='row'>
        <TopNav currentUser={currentUser} logout={() => dispatch(logout())}/>
      </div>
      <div className='row' id='mainRow'>
        <nav id='leftNav'>
          <button onClick={() => this.props.dispatch(increment())}>{this.props.count}</button>
        </nav>
        <div id='main'>
          {this.props.children}
        </div>
      </div>
    </div>
  }
}
