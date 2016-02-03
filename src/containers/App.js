import React from 'react'
import { connect } from 'react-redux'
import TopNav from '../components/TopNav'
import LeftNav from '../components/LeftNav'
import { logout, toggleMainMenu } from '../actions'
import { get, sortBy } from 'lodash'
const { bool, func, number, object } = React.PropTypes

const lastViewed = m => -Date.parse(m.last_viewed_at || '2001-01-01')

const App = connect(({ mainMenuOpened, people }) => ({
  currentUser: people.current,
  mainMenuOpened
}))(({ currentUser, dispatch, mainMenuOpened, children }) => {
  let communities = currentUser
    ? sortBy(currentUser.memberships, lastViewed).map(m => m.community)
    : []

  let unreadCount = get(currentUser, 'new_notification_count') || 0

  return <div>
    <div className='row'>
      <TopNav currentUser={currentUser}
        toggleMenu={() => dispatch(toggleMainMenu())}
        mainMenuOpened={mainMenuOpened}
        logout={() => dispatch(logout())}/>
    </div>
    <div className='row' id='mainRow'>
      <LeftNav communities={communities} open={mainMenuOpened} unreadCount={unreadCount}/>
      <div id='main'>{children}</div>
    </div>
  </div>
})

App.propTypes = {
  children: object,
  count: number,
  currentUser: object,
  dispatch: func,
  mainMenuOpened: bool
}

export default App
