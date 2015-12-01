import React from 'react'
import { connect } from 'react-redux'
import TopNav from '../components/TopNav'
import LeftNav from '../components/LeftNav'
import { logout } from '../actions'
import { sortBy } from 'lodash'
const { func, number, object } = React.PropTypes

const lastViewed = m => -Date.parse(m.last_viewed_at || '2001-01-01')

@connect(state => ({currentUser: state.people.current}))
export default class App extends React.Component {
  static propTypes = {
    children: object,
    count: number,
    currentUser: object,
    dispatch: func
  }

  render () {
    let { currentUser, dispatch } = this.props
    let communities = currentUser
      ? sortBy(currentUser.memberships, lastViewed).map(m => m.community)
      : []

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
