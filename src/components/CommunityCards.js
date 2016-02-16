import React from 'react'
import A from '../components/A'
import Masonry from 'react-masonry-component'

const CommunityCards = ({ communities }) => {
  return <div className='person-cards masonry-container'>
    <Masonry options={{transitionDuration: 0}}>
      {communities.map(community => <div key={community.id} className='masonry-item-wrapper'>
        <CommunityCard community={community} />
      </div>)}
    </Masonry>
  </div>
}

export default CommunityCards

const CommunityCard = ({ community }) => {
  let { id, avatar_url, banner_url, name, memberCount } = community
  return <div className='community-card'>
    <A to={`/c/${community.slug}`}>
      <div className='large-avatar' style={{backgroundImage: `url(${avatar_url})`}}/>
    </A>
    <br/>
    <A to={`/u/${community.id}`}>
      <div className='large-avatar' style={{backgroundImage: `url(${banner_url})`}}/>
    </A>
    <A className='name' to={`/u/${id}`}>{name}</A>
  </div>
}
