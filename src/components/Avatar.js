import React from 'react'
import { Link } from 'react-router'
import { handleMouseOver } from './Popover'
const { func } = React.PropTypes

export const bgStyle = url => {
  if (!url) return {}

  const escaped = url.replace(/([\(\)])/g, (match, $1) => '\\' + $1)
  return {backgroundImage: `url(${escaped})`}
}

const GenericAvatar = ({ person: { id, avatar_url }, isLink, showPopover }, { dispatch }) => {
  if (!id) return <span />

  const props = {
    className: 'avatar',
    style: bgStyle(avatar_url),
    onMouseOver: showPopover ? handleMouseOver(dispatch) : null
  }

  return isLink ? <div {...props}><Link to={`/u/${id}`} >&nbsp;</Link></div> : <div {...props} />
}
GenericAvatar.contextTypes = {dispatch: func}

const Avatar = ({ person, showPopover }) => {
  return <GenericAvatar person={person} isLink showPopover={showPopover} />
}

export const NonLinkAvatar = ({ person }) => {
  return <GenericAvatar person={person} />
}

export default Avatar
