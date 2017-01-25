import React from 'react'
import { Link } from 'react-router'
import { handleMouseOver } from './Popover'
import ChangeImageButton from './ChangeImageButton'
const { func } = React.PropTypes

export const bgStyle = url => {
  if (!url) return {}

  const escaped = url.replace(/([\(\)])/g, (match, $1) => '\\' + $1)
  return {backgroundImage: `url(${escaped})`}
}

const GenericAvatar = ({ person, isLink, showPopover, showEdit }, { dispatch }) => {
  if (!person) return <span />
  const { id, avatar_url } = person

  const props = {
    className: 'avatar',
    style: bgStyle(avatar_url),
    onMouseOver: showPopover ? handleMouseOver(dispatch) : null
  }

  return <div {...props}>
    {showEdit && <ChangeImageButton person={person} type='avatar_url' />}
    {isLink && <Link to={`/u/${id}`} >&nbsp;</Link>}
  </div>
}
GenericAvatar.contextTypes = {dispatch: func}

const Avatar = ({ person, showPopover, showEdit }) => {
  return <GenericAvatar person={person} isLink showPopover={showPopover} showEdit={showEdit} />
}

export const NonLinkAvatar = ({ person, showEdit }) => {
  return <GenericAvatar person={person} showEdit={showEdit} />
}

export default Avatar
