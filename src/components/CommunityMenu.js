import React from 'react'
import cx from 'classnames'
import { nextPath } from '../util/navigation'
import { merge } from 'lodash'
import { filter, flow, get, map, sortBy } from 'lodash/fp'
import { same } from '../models'
import { IndexA, A } from './A'
import Dropdown from './Dropdown'
import LazyLoader from './LazyLoader'
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

const CommunityMenu = ({ network, community }, { isMobile, dispatch, currentUser, location }) => {
  const firstItem = network ? merge(network, {isNetwork: true}) : community
  const menuItems = getMenuItems(currentUser, firstItem)
  const currentItem = menuItems[0]
  const { isNetwork } = currentItem

  const url = community => {
    const { query, pathname } = location
    return nextPath(pathname, community, false, query)
  }

  const conversationsUrl = firstItem.id
    ? `/${network ? 'n' : 'c'}/${firstItem.slug}`
    : '/app'

  const toggle = isMobile
    ? <img src={currentItem.avatar_url}/>
    : <span className='caret'/>

  return <div id='community-menu'>
    <IndexA to={conversationsUrl}>
      <img src={currentItem.avatar_url}/>
      <span className={cx('name', {network: isNetwork})}>
        {currentItem.name}
      </span>
    </IndexA>
    <Dropdown backdrop triangle toggleChildren={toggle} rivalrous='nav'>
      <li>
        <ul className='inner-list dropdown-menu'>
          <li>
            <A to={url()}>
              <img src={allCommunities().avatar_url}/> All Communities
            </A>
          </li>
          {menuItems.slice(1).map(community => <li key={community.id}>
            <A to={url(community)} title={community.name}>
              <LazyLoader>
                <img src={community.avatar_url}/>
              </LazyLoader>
              {community.name}
            </A>
          </li>)}
        </ul>
      </li>
      <li className='join-or-start'>
        <div>
          <A to='/c/join'>Join</A> or <A to='/create'>start</A> a community
        </div>
      </li>
    </Dropdown>
  </div>
}
CommunityMenu.contextTypes = {isMobile: bool, dispatch: func, currentUser: object, location: object}

export default CommunityMenu
