import React from 'react'
import { Link } from 'react-router'

const Avatar = ({ person: { id, avatar_url } }) => {
  if (!id) return <span></span>

  return <Link to={`/u/${id}`} className='avatar'
    style={{backgroundImage: `url(${avatar_url})`}}/>
}

export default Avatar
