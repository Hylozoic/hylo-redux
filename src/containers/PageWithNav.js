import React from 'react'
import { connect } from 'react-redux'
import { VelocityComponent } from 'velocity-react'
import TopNav from '../components/TopNav'
import NetworkNav from '../components/NetworkNav'
import { LeftNav, leftNavWidth, leftNavEasing } from '../components/LeftNav'
import { toggleLeftNav, updateUserSettings } from '../actions'
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
    {url: url('events'), icon: 'Calendar', label: 'Events'},
    {url: url('projects'), icon: 'ProjectorScreen', label: 'Projects'},
    {url: url('people'), icon: 'Users', label: 'Members'},
    {url: network && `/n/${network.slug}`, icon: 'merkaba', label: 'Network'},
    {url: slug && url('about'), icon: 'Help', label: 'About'},
    {url: canInvite(currentUser, community) && '/create/invite', icon: 'Mail', label: 'Invite'},
    {url: canModerate(currentUser, community) && url('settings'), icon: 'Settings', label: 'Community Settings'}
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
        dispatch(updateUserSettings(currentUser.id, {settings}))
      }, 5000)
    }
  }
  const openLeftNav = () => toggleLeftNavAndSave(true)
  const closeLeftNav = () => toggleLeftNavAndSave(false)
  const links = makeNavLinks(currentUser, community)
  const showNetworkNav = currentUser && !isMobile && networkCommunities &&
    networkCommunities.length > 1

  return <div>
    <LeftNav opened={leftNavIsOpen}
      links={links}
      community={community}
      network={network}
      tags={tags}
      close={closeLeftNav}/>

    <TopNav currentUser={currentUser}
      links={links}
      community={community}
      network={network}
      openLeftNav={openLeftNav}
      leftNavIsOpen={leftNavIsOpen}
      path={path}
      opened={leftNavIsOpen}/>

    <VelocityComponent animation={moveWithMenu} easing={leftNavEasing}>
      <div id='main'>
        {showNetworkNav && <NetworkNav
          communities={networkCommunities}
          network={network || community.network}/>}
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
    path: state.routing.path
  }
})(PageWithNav)
