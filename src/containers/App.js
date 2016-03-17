import React from 'react'
import { connect } from 'react-redux'
import { find } from 'lodash'
import TopNav from '../components/TopNav'
import { LeftNav, leftNavWidth, leftNavEasing } from '../components/LeftNav'
import Notifier from '../components/Notifier'
import LiveStatusPoller from '../components/LiveStatusPoller'
import PageTitleController from '../components/PageTitleController'
import { logout, removeNotification, toggleMainMenu } from '../actions'
import { VelocityComponent } from 'velocity-react'

const App = connect((state, { params: { id } }) => {
  const { leftNavOpened, notifierMessages } = state
  return {
    leftNavOpened,
    notifierMessages,
    currentUser: state.people.current,
    community: find(state.communities, c => c.id === state.currentCommunityId),
    path: state.routing.path
  }
})(props => {
  const {
    children,
    community,
    currentUser,
    dispatch,
    leftNavOpened,
    notifierMessages,
    path
  } = props

  const moveWithMenu = {marginLeft: leftNavOpened ? leftNavWidth : 0}
  const toggleLeftNav = () => dispatch(toggleMainMenu())

  return <div>
    <LeftNav opened={leftNavOpened}
      community={community}
      close={toggleLeftNav}/>

    <VelocityComponent animation={moveWithMenu} easing={leftNavEasing}>
      <div>
        <TopNav currentUser={currentUser}
          community={community}
          openLeftNav={toggleLeftNav}
          leftNavOpened={leftNavOpened}
          logout={() => dispatch(logout())}
          path={path}/>
        {children}
      </div>
    </VelocityComponent>

    <Notifier messages={notifierMessages}
      remove={id => dispatch(removeNotification(id))}/>
    <LiveStatusPoller/>
    <PageTitleController/>
  </div>
})

export default App
