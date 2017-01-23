import React from 'react'

export default function CommunityHeader ({ community }) {
  return !community ? null : <div className='modal-topper'>
    <div className='medium-avatar' style={{backgroundImage: `url(${community.avatar_url})`}} />
    <h2>Join {community.name}</h2>
  </div>
}
