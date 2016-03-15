import React from 'react'
import { connect } from 'react-redux'
import TopNav from '../components/TopNav'
import { LeftNav, leftNavWidth, leftNavEasing } from '../components/LeftNav'
import Notifier from '../components/Notifier'
import LiveStatusPoller from '../components/LiveStatusPoller'
import PageTitleController from '../components/PageTitleController'
import { logout, removeNotification, toggleMainMenu } from '../actions'
import { sortBy } from 'lodash'
import { VelocityComponent } from 'velocity-react'
const { bool, func, number, object } = React.PropTypes

const lastViewed = m => -Date.parse(m.last_viewed_at || '2001-01-01')

const App = connect(({ leftNavOpened, people, notifierMessages, showAllCommunities, routing: { path } }) => ({
  currentUser: people.current,
  leftNavOpened,
  notifierMessages,
  showAllCommunities,
  path
}))(props => {
  const {
    currentUser,
    dispatch,
    leftNavOpened,
    notifierMessages,
    path,
    children
  } = props

  const communities = currentUser
    ? sortBy(currentUser.memberships, lastViewed).map(m => m.community)
    : []

  const currentCommunity = communities[0] // TODO
  const moveWithMenu = {marginLeft: leftNavOpened ? leftNavWidth : 0}
  const toggleLeftNav = () => dispatch(toggleMainMenu())

  return <div>
    <LeftNav opened={leftNavOpened}
      community={currentCommunity}
      close={toggleLeftNav}/>

    <VelocityComponent animation={moveWithMenu} easing={leftNavEasing}>
      <div>
        <TopNav currentUser={currentUser}
          openLeftNav={toggleLeftNav}
          leftNavOpened={leftNavOpened}
          logout={() => dispatch(logout())}
          path={path}/>
        {children}
      </div>
    </VelocityComponent>

    <Notifier messages={notifierMessages}
      remove={id => dispatch(removeNotification(id))}/>
    <LiveStatusPoller />
    <PageTitleController />
  </div>
})

App.propTypes = {
  children: object,
  count: number,
  currentUser: object,
  dispatch: func,
  leftNavOpened: bool
}

export default App
