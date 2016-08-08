import React from 'react'
import qs from 'querystring'
import cx from 'classnames'
import { nextPath } from '../util/navigation'
import { merge } from 'lodash'
import { filter, flow, get, map, sortBy } from 'lodash/fp'
import { same } from '../models'
import { navigate } from '../actions'
import A from './A'
import Dropdown from './Dropdown'
import { assetUrl } from '../util/assets'
const { object, func, bool } = React.PropTypes

const getMenuItems = (currentUser, firstItem) =>
  [firstItem].concat(flow(
    get('memberships'),
    sortBy(m => -Date.parse(m.last_viewed_at || '2001-01-01')),
    map('community'),
    firstItem.isNetwork ? i => i : filter(c => !same('id', firstItem, c))
  )(currentUser))

export const allCommunities = () => ({
  id: null,
  avatar_url: assetUrl('/img/hylo-merkaba-300x300.png'),
  name: 'All Communities'
})

const CommunityMenu = ({ network, community }, { isMobile, dispatch, currentUser }) => {
  const firstItem = network ? merge(network, {isNetwork: true}) : community
  const menuItems = getMenuItems(currentUser, firstItem)
  const currentItem = menuItems[0]
  const { isNetwork } = currentItem
  const visit = community => {
    const { search, pathname } = window.location
    const query = qs.parse(search.replace(/^\?/, ''))
    return dispatch(navigate(nextPath(pathname, community, false, query)))
  }

  return <Dropdown className='communities' backdrop triangle toggleChildren={
      <div>
        <img src={currentItem.avatar_url}/>
        <span className={cx('name', {network: isNetwork})}>
          {currentItem.name}
        </span>
        <span className='caret'></span>
        {isNetwork && <span className='subtitle'>Network</span>}
      </div>
    }>
    <li>
      <ul className='inner-list dropdown-menu'>
        <li key='all'>
          <a onClick={() => visit()}>
            <img src={allCommunities().avatar_url}/> All Communities
          </a>
        </li>
        {menuItems.slice(1).map(community => <li key={community.id}>
          <a onClick={() => visit(community)} title={community.name}>
            <img src={community.avatar_url}/> {community.name}
          </a>
        </li>)}
      </ul>
    </li>
    <li className='join-or-start'>
      <div>
        <A to='/c/join'>Join</A> or <A to='/c/new'>start</A> a community
      </div>
    </li>
  </Dropdown>
}
CommunityMenu.contextTypes = {isMobile: bool, dispatch: func, currentUser: object}

export default CommunityMenu
