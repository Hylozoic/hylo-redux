import React from 'react'
import { connect } from 'react-redux'
import TopNav from '../components/TopNav'
import LeftNav from '../components/LeftNav'
import { logout, toggleMainMenu } from '../actions'
import { sortBy } from 'lodash'
const { bool, func, number, object } = React.PropTypes

const lastViewed = m => -Date.parse(m.last_viewed_at || '2001-01-01')

@connect(({ mainMenuOpened, people }) => ({
  currentUser: people.current,
  mainMenuOpened
}))
export default class App extends React.Component {
  static propTypes = {
    children: object,
    count: number,
    currentUser: object,
    dispatch: func,
    mainMenuOpened: bool
  }

  render () {
    let { currentUser, dispatch, mainMenuOpened } = this.props
    let communities = currentUser
      ? sortBy(currentUser.memberships, lastViewed).map(m => m.community)
      : []

    return <div>
      <div className='row'>
        <TopNav currentUser={currentUser}
          toggleMenu={() => dispatch(toggleMainMenu())}
          mainMenuOpened={mainMenuOpened}
          logout={() => dispatch(logout())}/>
      </div>
      <div className='row' id='mainRow'>
        <LeftNav communities={communities} open={mainMenuOpened}/>
        <div id='main'>
          {this.props.children}
        </div>
      </div>
    </div>
  }
}
