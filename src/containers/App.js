import React from 'react'
import { connect } from 'react-redux'
import TopNav from '../components/TopNav'
import { fetchCurrentUser, logout } from '../actions'
import { prefetch } from 'react-fetcher'
const { func, number, object } = React.PropTypes

const increment = function () {
  return {
    type: 'INCREMENT',
    payload: {
      hello: 'world'
    }
  }
}

@prefetch(({dispatch}) => dispatch(fetchCurrentUser()))
@connect(state => state)
export default class App extends React.Component {
  static propTypes = {
    children: object,
    count: number,
    currentUser: object,
    dispatch: func
  }

  render () {
    let { currentUser, dispatch } = this.props
    return <div>
      <div className='row'>
        <TopNav currentUser={currentUser} logout={() => dispatch(logout())}/>
      </div>
      <div className='row' id='mainRow'>
        <nav id='leftNav'>
          <button onClick={() => dispatch(increment())}>{this.props.count}</button>
        </nav>
        <div id='main'>
          {this.props.children}
        </div>
      </div>
    </div>
  }
}
