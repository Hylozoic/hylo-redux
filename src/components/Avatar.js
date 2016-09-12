import React from 'react'
import { Link } from 'react-router'

const bgStyle = url => {
  if (!url) return {}

  const escaped = url.replace(/([\(\)])/g, (match, $1) => '\\' + $1)
  return {backgroundImage: `url(${escaped})`}
}

const Avatar = ({ person: { id, avatar_url } }) => {
  if (!id) return <span></span>

  return <Link to={`/u/${id}`} className='avatar' style={bgStyle(avatar_url)}/>
}

export const NonLinkAvatar = ({ person: { id, avatar_url } }) => {
  if (!id) return <span></span>
  return <div className='avatar' style={bgStyle(avatar_url)}/>
}

export default Avatar
