import React from 'react'
import { connect } from 'react-redux'
import TopNav from '../components/TopNav'
import LeftNav from '../components/LeftNav'
import { fetchCurrentUser, logout } from '../actions'
import { prefetch } from 'react-fetcher'
const { func, number, object } = React.PropTypes

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
    let communities = currentUser ? currentUser.memberships.map(m => m.community) : []

    return <div>
      <div className='row'>
        <TopNav currentUser={currentUser} logout={() => dispatch(logout())}/>
      </div>
      <div className='row' id='mainRow'>
        <LeftNav communities={communities}/>
        <div id='main'>
          {this.props.children}
        </div>
      </div>
    </div>
  }
}
