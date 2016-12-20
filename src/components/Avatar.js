import React from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { handleMouseOver } from './popover'

export const bgStyle = url => {
  if (!url) return {}

  const escaped = url.replace(/([\(\)])/g, (match, $1) => '\\' + $1)
  return {backgroundImage: `url(${escaped})`}
}

const GenericAvatar = connect()(({ person: { id, avatar_url }, isLink, showPopover, dispatch }) => {
  if (!id) return <span />

  const props = {
    className: 'avatar',
    style: bgStyle(avatar_url),
    to: isLink ? `/u/${id}` : null,
    onMouseOver: showPopover ? handleMouseOver(dispatch) : null
  }

  return isLink ? <Link {...props} /> : <div {...props} />
})

const Avatar = ({ person, showPopover }) => {
  return <GenericAvatar person={person} isLink showPopover />
}

export const NonLinkAvatar = ({ person }) => {
  return <GenericAvatar person={person} />
}

export default Avatar
