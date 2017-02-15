import React from 'react'
import cx from 'classnames'
import { nextPath } from '../util/navigation'
import { merge } from 'lodash'
import { flow, get, map, sortBy } from 'lodash/fp'
import A, { IndexA} from './A'
import Dropdown from './Dropdown'
import LazyLoader from './LazyLoader'
import { assetUrl } from '../util/assets'
import { navigate } from '../actions'
const { object, func, bool } = React.PropTypes

const getMenuItems = (currentUser, firstItem) =>
  [firstItem].concat(flow(
    get('memberships'),
    sortBy(m => -Date.parse(m.last_viewed_at || '2001-01-01')),
    map('community')
  )(currentUser))

export const allCommunities = () => ({
  id: null,
  avatar_url: assetUrl('/img/hylo-merkaba-300x300.png'),
  name: 'All Communities'
})

const CommunityMenu = ({ network, community }, { isMobile, dispatch, currentUser, location }) => {
  // don't show All Communities if the user is in only one
  const onlyOneCommunity = get('memberships.length', currentUser) === 1
  if (onlyOneCommunity && !community.id) {
    community = currentUser.memberships[0].community
  }
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
    ? <img src={currentItem.avatar_url} />
    : <span className='caret' />

  const visitCommunity = () => dispatch(navigate(`/c/${community.slug}`))

  return <div id='community-menu'>
    <IndexA to={conversationsUrl}>
      <img src={currentItem.avatar_url} />
      <span className={cx('name', {network: isNetwork})}>
        {currentItem.name}
      </span>
    </IndexA>
    <Dropdown backdrop triangle toggleChildren={toggle} rivalrous='nav'
      insteadOfOpening={onlyOneCommunity && isMobile && visitCommunity}>
      <li>
        <ul className='inner-list dropdown-menu'>
          {menuItems.length > 2 && <li>
            <A to={url()}>
              <img src={allCommunities().avatar_url} /> All Communities
            </A>
          </li>}
          {menuItems.slice(1).map(community => <li key={community.id}>
            <A to={url(community)} title={community.name}>
              <LazyLoader>
                <img src={community.avatar_url} />
              </LazyLoader>
              {community.name}
            </A>
          </li>)}
        </ul>
      </li>
      <li className='start'>
        <div>
          <A to='/create'>Start your own community</A>
        </div>
      </li>
    </Dropdown>
  </div>
}
CommunityMenu.contextTypes = {isMobile: bool, dispatch: func, currentUser: object, location: object}

export default CommunityMenu
