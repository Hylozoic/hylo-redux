import React from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'
import { find } from 'lodash'
import TopNav from '../components/TopNav'
import { LeftNav, leftNavWidth, leftNavEasing } from '../components/LeftNav'
import Notifier from '../components/Notifier'
import LiveStatusPoller from '../components/LiveStatusPoller'
import PageTitleController from '../components/PageTitleController'
import { logout, navigate, removeNotification, toggleMainMenu, updateUserSettings } from '../actions'
import { makeUrl } from '../client/util'
import { VelocityComponent } from 'velocity-react'
import { canInvite, canModerate } from '../models/currentUser'
import { isMobile } from '../util'
import { get, pick } from 'lodash'
const { array, bool, func, object, string } = React.PropTypes

@connect((state, { params: { id } }) => {
  const { leftNavIsOpen, notifierMessages } = state
  const currentUser = state.people.current
  const settingsleftNavIsOpen = get(currentUser, 'settings.leftNavIsOpen')
  const community = find(state.communities, c => c.id === state.currentCommunityId)
  const tags = community ? state.tagsByCommunity[community.slug] : {}

  return {
    leftNavIsOpen: settingsleftNavIsOpen === undefined ? leftNavIsOpen : settingsleftNavIsOpen,
    notifierMessages,
    currentUser,
    community,
    tags,
    path: state.routing.path
  }
})
export default class App extends React.Component {
  static propTypes = {
    children: object,
    community: object,
    currentUser: object,
    leftNavIsOpen: bool,
    tags: object,
    notifierMessages: array,
    path: string,
    dispatch: func
  }

  static childContextTypes = {
    dispatch: func,
    currentUser: object
  }

  getChildContext () {
    return pick(this.props, 'dispatch', 'currentUser')
  }

  render () {
    const {
      children,
      community,
      currentUser,
      dispatch,
      tags,
      leftNavIsOpen,
      notifierMessages
    } = this.props

    const path = this.props.path.split('?')[0]

    const moveWithMenu = {marginLeft: leftNavIsOpen ? leftNavWidth : 0}
    const toggleLeftNav = open => {
      dispatch(toggleMainMenu())
      if (!isMobile() && currentUser) {
        dispatch(updateUserSettings(currentUser.id, {settings: {leftNavIsOpen: open}}, {settings: {leftNavIsOpen: !open}}))
      }
    }
    const openLeftNav = () => toggleLeftNav(true)
    const closeLeftNav = () => toggleLeftNav(false)
    const doSearch = text => dispatch(navigate(makeUrl('/search', {q: text})))
    const visitCommunity = community => {
      const match = path.match(/(events|projects|members|about|invite)$/)
      const pathStart = community ? `/c/${community.slug}` : ''
      const pathEnd = match ? `/${match[1]}` : ''
      dispatch(navigate(pathStart + pathEnd))
    }

    return <div className={cx({leftNavIsOpen})}>
      <LeftNav opened={leftNavIsOpen}
        community={community}
        tags={tags}
        canModerate={canModerate(currentUser, community)}
        canInvite={canInvite(currentUser, community)}
        close={closeLeftNav}/>

      <VelocityComponent animation={moveWithMenu} easing={leftNavEasing}>
        <div>
          <TopNav currentUser={currentUser}
            community={community}
            onChangeCommunity={visitCommunity}
            openLeftNav={openLeftNav}
            leftNavIsOpen={leftNavIsOpen}
            logout={() => dispatch(logout())}
            path={path}
            search={doSearch}/>
          {children}
        </div>
      </VelocityComponent>

      <Notifier messages={notifierMessages}
        remove={id => dispatch(removeNotification(id))}/>
      <LiveStatusPoller/>
      <PageTitleController/>
    </div>
  }
}
