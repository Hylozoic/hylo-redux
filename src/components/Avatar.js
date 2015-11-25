import React from 'react'
import { Link } from 'react-router'

const Avatar = props => {
  let { id, avatar_url } = props.person
  if (!id) return <span></span>

  return <Link to={`/u/${id}`} className='avatar'
    style={{backgroundImage: `url(${avatar_url})`}}/>
}

export default Avatar
