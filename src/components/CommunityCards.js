import React from 'react'
import A from '../components/A'
import Masonry from 'react-masonry-component'

const CommunityCards = ({ communities }) => {
  return <div className='community-cards masonry-container'>
    <Masonry options={{transitionDuration: 0}}>
      {communities.map(community => <div key={community.id} className='masonry-item-wrapper'>
        <CommunityCard community={community} />
      </div>)}
    </Masonry>
  </div>
}

export default CommunityCards

const CommunityCard = ({ community }) => {
  let { slug, avatar_url, banner_url, name, memberCount } = community

  return <div className='community-card-wrapper'>
    <div className='community-card'>
      <A to={`/c/${slug}`}>
        <div className='banner'>
          <div className='background' style={{backgroundImage: `url(${banner_url})`}}>
          </div>
        </div>
        <div className='middle-content'>
          <div className='logo' style={{backgroundImage: `url(${avatar_url})`}}/>
          <div className='name'>{name}</div>
          {memberCount} member{memberCount === 1 ? '' : 's'}
        </div>
      </A>
    </div>
  </div>
}
