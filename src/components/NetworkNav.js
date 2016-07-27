import React from 'react'
import { A } from './A'
import Icon from './Icon'
import Dropdown from './Dropdown'
import { sortBy } from 'lodash/fp'
import { communityUrl, networkUrl } from '../routes'

const NetworkNav = ({ communities, network }, { isMobile }) => {
  const removeImpactHub = name => name.replace(/^Impact Hub /, '')
  return <div id='networkNav'>
    <Dropdown className='all-communities' alignRight={true}
      toggleChildren={<Icon name='More'/>}>
      {sortBy('name', communities).map(community =>
        <li key={community.slug}>
          <A to={communityUrl(community)}>
            {removeImpactHub(community.name)}
          </A>
        </li>)}
    </Dropdown>
    Communities: <A to={networkUrl(network)}>All</A>
    {communities.map(community =>
      <A to={communityUrl(community)} key={community.slug}>
        {removeImpactHub(community.name)}
      </A>)}
  </div>
}

export default NetworkNav
