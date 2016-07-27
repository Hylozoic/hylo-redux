import React from 'react'
import cx from 'classnames'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { debounce, includes, isEmpty, pick } from 'lodash'
import { filter, get } from 'lodash/fp'
import TopNav from '../components/TopNav'
import { LeftNav, leftNavWidth, leftNavEasing } from '../components/LeftNav'
import Notifier from '../components/Notifier'
import LiveStatusPoller from '../components/LiveStatusPoller'
import PageTitleController from '../components/PageTitleController'
import TagPopover from '../components/TagPopover'
import { logout, navigate, removeNotification, toggleLeftNav, updateUserSettings } from '../actions'
import { calliOSBridge, iOSAppVersion, isMobile as testIsMobile } from '../client/util'
import { VelocityComponent } from 'velocity-react'
import { canInvite, canModerate } from '../models/currentUser'
import { aggregatedTags } from '../models/hashtag'
import { matchEditorUrl } from './StandalonePostEditor'
import { ModalWrapper } from '../components/Modal'
import { makeUrl, nextPath } from '../util/navigation'
import { setMobileDevice } from '../actions'
import { getCurrentCommunity } from '../models/community'
import { getCurrentNetwork } from '../models/network'
const { array, bool, func, object, string } = React.PropTypes

const makeNavLinks = (currentUser, community) => {
  const { slug, network } = community || {}
  const url = slug ? suffix => `/c/${slug}/${suffix}` : suffix => '/' + suffix
  const rootUrl = slug ? `/c/${slug}` : '/app'
  return filter('url', [
    {url: rootUrl, icon: 'Comment-Alt', label: 'Conversations', index: true},
    {url: url('events'), icon: 'Calendar', label: 'Events'},
    {url: url('projects'), icon: 'ProjectorScreen', label: 'Projects'},
    {url: url('people'), icon: 'Users', label: 'Members'},
    {url: network && `/n/${network.slug}`, icon: 'merkaba', label: 'Network'},
    {url: slug && url('about'), icon: 'Help', label: 'About'},
    {url: canInvite(currentUser, community) && url('invite'), icon: 'Mail', label: 'Invite'},
    {url: canModerate(currentUser, community) && url('settings'), icon: 'Settings', label: 'Admin Settings'}
  ])
}

@prefetch(({ store, dispatch }) => {
  const { isMobile, people } = store.getState()
  if (!isMobile && typeof window === 'undefined' &&
    get('settings.leftNavIsOpen', people.current)) {
    return dispatch(toggleLeftNav())
  }
})
@connect((state, { params }) => {
  const {
    isMobile, leftNavIsOpen, notifierMessages, showModal, tagsByCommunity,
    people, routing: { path }, communitiesForNetworkNav
  } = state
  const community = getCurrentCommunity(state)
  const network = getCurrentNetwork(state)
  const networkCommunities =
    communitiesForNetworkNav[network ? network.id : get('network.id', community)]
  return {
    path,
    network,
    isMobile,
    community,
    showModal,
    leftNavIsOpen,
    notifierMessages,
    networkCommunities,
    currentUser: people.current,
    tags: get(get('slug', community), tagsByCommunity) || aggregatedTags(state)
  }
}, null, null, {withRef: true})
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
    showModal: object,
    location: object,
    networkCommunities: array
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

    window.addEventListener('resize', debounce(event => {
      this.props.dispatch(setMobileDevice(testIsMobile()))
    }), 1000)
  }

  render () {
    const {
      children, community, currentUser, dispatch, tags, leftNavIsOpen, network,
      notifierMessages, isMobile, showModal, location: { query }, networkCommunities
    } = this.props

    const path = this.props.path.split('?')[0]
    const hideTopNav = matchEditorUrl(path) || includes([
      '/login', '/signup', '/set-password'
    ], path)

    const moveWithMenu = {marginLeft: leftNavIsOpen ? leftNavWidth : 0}
    const toggleLeftNavAndSave = open => {
      if (leftNavIsOpen !== open) dispatch(toggleLeftNav())
      if (!isMobile) {
        setTimeout(() => {
          const settings = {leftNavIsOpen: open}
          dispatch(updateUserSettings(currentUser.id, {settings}))
        }, 5000)
      }
    }
    const openLeftNav = () => toggleLeftNavAndSave(true)
    const closeLeftNav = () => toggleLeftNavAndSave(false)
    const doSearch = text => dispatch(navigate(makeUrl('/search', {q: text})))
    const visitCommunity = community =>
      dispatch(navigate(nextPath(path, community, false, query)))

    const links = makeNavLinks(currentUser, community)

    return <div className={cx({leftNavIsOpen, isMobile, showModal: !isEmpty(showModal)})}>
      <LeftNav opened={leftNavIsOpen}
        links={links}
        community={community}
        network={network}
        tags={tags}
        close={closeLeftNav}/>

      {!hideTopNav && <TopNav currentUser={currentUser}
        links={links}
        community={community}
        network={network}
        networkCommunities={networkCommunities}
        onChangeCommunity={visitCommunity}
        openLeftNav={openLeftNav}
        leftNavIsOpen={leftNavIsOpen}
        logout={() => {
          calliOSBridge({type: 'logout'})
          dispatch(logout())
        }}
        path={path}
        search={doSearch}
        opened={leftNavIsOpen}
        networkNavAnimation={moveWithMenu}
        networkNavEasing={leftNavEasing}
        />}

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
      <ModalWrapper show={get('show', showModal)} params={get('params', showModal)}/>
    </div>
  }
}
