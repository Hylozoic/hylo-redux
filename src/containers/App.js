import React from 'react'
import cx from 'classnames'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { find } from 'lodash'
import TopNav from '../components/TopNav'
import Search from '../components/Search'
import Icon from '../components/Icon'
import { LeftNav, leftNavWidth, leftNavEasing } from '../components/LeftNav'
import Notifier from '../components/Notifier'
import LiveStatusPoller from '../components/LiveStatusPoller'
import PageTitleController from '../components/PageTitleController'
import { logout, navigate, removeNotification, toggleMainMenu, updateUserSettings } from '../actions'
import { makeUrl } from '../client/util'
import { VelocityComponent } from 'velocity-react'
import { canInvite, canModerate } from '../models/currentUser'
import { get, pick } from 'lodash'
import { matchEditorUrl } from './StandalonePostEditor'
import { changeViewportTop } from '../util/scrolling'
import { isSearchUrl } from '../routes'
const { array, bool, func, object, string } = React.PropTypes

@prefetch(({ store, dispatch }) => {
  const { isMobile, people } = store.getState()
  if (!isMobile && typeof window === 'undefined' &&
    get(people.current, 'settings.leftNavIsOpen')) {
    return dispatch(toggleMainMenu())
  }
})
@connect((state, { params }) => {
  const { isMobile, leftNavIsOpen, notifierMessages } = state
  const currentUser = state.people.current
  const community = find(state.communities, c => c.id === state.currentCommunityId)
  const tags = community ? state.tagsByCommunity[community.slug] : {}

  return {
    isMobile,
    leftNavIsOpen,
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
    dispatch: func,
    isMobile: bool
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
      children, community, currentUser, dispatch, tags,
      leftNavIsOpen, notifierMessages, isMobile
    } = this.props

    const path = this.props.path.split('?')[0]
    const hideTopNav = matchEditorUrl(path)
    const hideMobileSearch = isSearchUrl(this.props.path)

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

    return <div className={cx({leftNavIsOpen, isMobile})}>
      <LeftNav opened={leftNavIsOpen}
        community={community}
        tags={tags}
        canModerate={canModerate(currentUser, community)}
        canInvite={canInvite(currentUser, community)}
        close={closeLeftNav}/>

      <VelocityComponent animation={moveWithMenu} easing={leftNavEasing}>
        <div id='main'>
          {!hideTopNav && <TopNav currentUser={currentUser}
            community={community}
            onChangeCommunity={visitCommunity}
            openLeftNav={openLeftNav}
            leftNavIsOpen={leftNavIsOpen}
            logout={() => dispatch(logout())}
            path={path}
            search={doSearch}
            opened={leftNavIsOpen}
            isMobile={isMobile}/>}
          {isMobile && !hideMobileSearch && <MobileSearch search={doSearch} />}
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

class MobileSearch extends React.Component {
  static propTypes = {
    search: func
  }

  componentDidMount () {
    this.refs.mobileSearch.className = 'mobile-search'
    changeViewportTop(40)
  }

  render () {
    const { search } = this.props
    return <div className='mobile-search hidden' ref='mobileSearch'>
      <Icon name='Loupe'/>
      <Search onChange={search}/>
    </div>
  }
}

const nextPath = (path, community) => {
  const pathStart = community ? `/c/${community.slug}` : ''
  const match = community
    ? path.match(/(events|projects|members|about|invite|notifications)$/)
    : path.match(/(events|projects|notifications)$/)
  const pathEnd = match ? `/${match[1]}` : ''

  return pathStart + pathEnd
}
