import React from 'react'
import { connect } from 'react-redux'
import { VelocityComponent } from 'velocity-react'
import TopNav from '../components/TopNav'
import NetworkNav from '../components/NetworkNav'
import LeftNav, { leftNavWidth, leftNavEasing } from '../components/LeftNav'
import { toggleLeftNav, updateCurrentUser } from '../actions'
import { getCurrentCommunity } from '../models/community'
import { getCurrentNetwork } from '../models/network'
import { aggregatedTags } from '../models/hashtag'
import { canInvite, canModerate } from '../models/currentUser'
import { filter, get } from 'lodash/fp'
const { array, bool, func, object, oneOfType, string } = React.PropTypes

const makeNavLinks = (currentUser, community) => {
  const { slug, network } = community || {}
  const url = slug ? suffix => `/c/${slug}/${suffix}` : suffix => '/' + suffix
  const rootUrl = slug ? `/c/${slug}` : '/app'

  return filter('url', [
    {url: rootUrl, icon: 'Comment-Alt', label: 'Conversations', index: true},
    get('settings.events.enabled', community) && {url: url('events'), icon: 'Calendar', label: 'Events'},
    get('settings.projects.enabled', community) && {url: url('projects'), icon: 'ProjectorScreen', label: 'Projects'},
    {url: url('people'), icon: 'Users', label: 'Members'},
    canInvite(currentUser, community) && {url: url('invite'), icon: 'Mail', label: 'Invite'},
    {url: network && `/n/${network.slug}`, icon: 'merkaba', label: 'Network'},
    canModerate(currentUser, community) && {url: url('settings'), icon: 'Settings', label: 'Settings'},
    {url: slug && url('about'), icon: 'Help', label: 'About'}
  ])
}

const PageWithNav = (props, context) => {
  const {
    leftNavIsOpen, community, networkCommunities, network, tags, path, children
  } = props
  const { dispatch, currentUser, isMobile } = context

  const moveWithMenu = {marginLeft: leftNavIsOpen ? leftNavWidth : 0}
  const toggleLeftNavAndSave = open => {
    if (leftNavIsOpen !== open) dispatch(toggleLeftNav())
    if (!isMobile) {
      setTimeout(() => {
        const settings = {leftNavIsOpen: open}
        dispatch(updateCurrentUser({settings}))
      }, 5000)
    }
  }
  const openLeftNav = () => toggleLeftNavAndSave(true)
  const closeLeftNav = () => toggleLeftNavAndSave(false)
  const links = makeNavLinks(currentUser, community)
  const showNetworkNav = currentUser && !isMobile && networkCommunities &&
    networkCommunities.length > 1 && !path.startsWith('/t/')
  const tagNotificationCount = filter(tag => tag.new_post_count > 0, tags).length

  return <div>
    {currentUser && <LeftNav opened={leftNavIsOpen}
      links={links}
      community={community}
      network={network}
      tags={tags}
      close={closeLeftNav} />}

    <TopNav currentUser={currentUser}
      links={links}
      community={community}
      network={network}
      openLeftNav={openLeftNav}
      leftNavIsOpen={leftNavIsOpen}
      path={path}
      opened={leftNavIsOpen}
      tagNotificationCount={tagNotificationCount} />

    <VelocityComponent animation={moveWithMenu} easing={leftNavEasing}>
      <div id='main'>
        {showNetworkNav && <NetworkNav
          communities={networkCommunities}
          network={network || community.network} />}
        {children}
      </div>
    </VelocityComponent>
  </div>
}

PageWithNav.propTypes = {
  leftNavIsOpen: bool,
  community: object,
  network: object,
  networkCommunities: array,
  tags: object,
  path: string,
  children: oneOfType([array, object]),
  history: object
}
PageWithNav.contextTypes = {isMobile: bool, dispatch: func, currentUser: object}

export default connect((state, props) => {
  const { leftNavIsOpen, tagsByCommunity, communitiesForNetworkNav } = state
  const community = getCurrentCommunity(state)
  const network = getCurrentNetwork(state)
  const networkCommunities =
    communitiesForNetworkNav[network ? network.id : get('network.id', community)]

  return {
    leftNavIsOpen, community, networkCommunities, network,
    tags: get(get('slug', community), tagsByCommunity) || aggregatedTags(state),
    path: state.routing.locationBeforeTransitions.pathname
  }
})(PageWithNav)
