import React from 'react'
import cx from 'classnames'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { find, includes } from 'lodash'
import TopNav from '../components/TopNav'
import { LeftNav, leftNavWidth, leftNavEasing } from '../components/LeftNav'
import Notifier from '../components/Notifier'
import LiveStatusPoller from '../components/LiveStatusPoller'
import PageTitleController from '../components/PageTitleController'
import TagPopover from '../components/TagPopover'
import { logout, navigate, removeNotification, toggleMainMenu, updateUserSettings } from '../actions'
import { makeUrl, calliOSBridge, iOSAppVersion } from '../client/util'
import { VelocityComponent } from 'velocity-react'
import { canInvite, canModerate } from '../models/currentUser'
import { get, pick } from 'lodash'
import { matchEditorUrl } from './StandalonePostEditor'
import { ModalWrapper } from '../components/Modal'
const { array, bool, func, object, string } = React.PropTypes

@prefetch(({ store, dispatch }) => {
  const { isMobile, people } = store.getState()
  if (!isMobile && typeof window === 'undefined' &&
    get(people.current, 'settings.leftNavIsOpen')) {
    return dispatch(toggleMainMenu())
  }
})
@connect((state, { params }) => {
  const { isMobile, leftNavIsOpen, notifierMessages, showModal } = state
  const currentUser = state.people.current
  const community = find(state.communities, c => c.id === state.currentCommunityId)
  const network = find(state.networks, n => n.id === state.currentNetworkId)
  const tags = community ? state.tagsByCommunity[community.slug] : {}

  return {
    isMobile,
    leftNavIsOpen,
    notifierMessages,
    currentUser,
    community,
    network,
    tags,
    path: state.routing.path,
    showModal
  }
})
export default class App extends React.Component {
  static propTypes = {
    children: object,
    community: object,
    currentUser: object,
    leftNavIsOpen: bool,
    tags: object,
    network: object,
    notifierMessages: array,
    path: string,
    dispatch: func,
    isMobile: bool,
    showModal: string
  }

  static childContextTypes = {
    dispatch: func,
    currentUser: object,
    isMobile: bool
  }

  getChildContext () {
    return pick(this.props, 'dispatch', 'currentUser', 'isMobile')
  }

  componentDidMount () {
    const version = Number(iOSAppVersion())
    if (version < 1.7) {
      window.location = 'https://www.hylo.com/newapp'
    }
  }

  render () {
    const {
      children, community, currentUser, dispatch, tags, leftNavIsOpen, network,
      notifierMessages, isMobile, showModal
    } = this.props

    const path = this.props.path.split('?')[0]
    const hideTopNav = matchEditorUrl(path) || includes([
      '/login', '/signup', '/set-password'
    ], path)

    const moveWithMenu = {marginLeft: leftNavIsOpen ? leftNavWidth : 0}
    const toggleLeftNav = open => {
      if (leftNavIsOpen !== open) dispatch(toggleMainMenu())
      if (!isMobile) {
        setTimeout(() => {
          const settings = {leftNavIsOpen: open}
          dispatch(updateUserSettings(currentUser.id, {settings}))
        }, 1000)
      }
    }
    const openLeftNav = () => toggleLeftNav(true)
    const closeLeftNav = () => toggleLeftNav(false)
    const doSearch = text => dispatch(navigate(makeUrl('/search', {q: text})))
    const visitCommunity = community =>
      dispatch(navigate(nextPath(path, community)))

    return <div className={cx({leftNavIsOpen, isMobile, showModal})}>
      <LeftNav opened={leftNavIsOpen}
        community={community}
        network={network}
        tags={tags}
        canModerate={canModerate(currentUser, community)}
        canInvite={canInvite(currentUser, community)}
        close={closeLeftNav}/>

      {!hideTopNav && <TopNav currentUser={currentUser}
        community={community}
        network={network}
        onChangeCommunity={visitCommunity}
        openLeftNav={openLeftNav}
        leftNavIsOpen={leftNavIsOpen}
        logout={() => {
          calliOSBridge({type: 'logout'})
          dispatch(logout())
        }}
        path={path}
        search={doSearch}
        opened={leftNavIsOpen}/>}

      <VelocityComponent animation={moveWithMenu} easing={leftNavEasing}>
        <div id='main'>
          {children}
        </div>
      </VelocityComponent>

      <Notifier messages={notifierMessages}
        remove={id => dispatch(removeNotification(id))}/>
      <LiveStatusPoller community={community}/>
      <PageTitleController/>
      <TagPopover/>
      <ModalWrapper show={showModal}/>
    </div>
  }
}

export const nextPath = (path, community, isNetwork) => {
  const pathStart = community ? `/${isNetwork ? 'n' : 'c'}/${community.slug}` : ''
  const match = community
    ? path.match(/(events|projects|members|about|invite|notifications)$/)
    : path.match(/(events|projects|notifications)$/)
  const pathEnd = match ? `/${match[1]}` : ''

  return (pathStart + pathEnd) || '/app'
}
