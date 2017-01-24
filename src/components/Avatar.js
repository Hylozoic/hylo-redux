import React from 'react'
import { Link } from 'react-router'
import { handleMouseOver } from './Popover'
const { func } = React.PropTypes

export const bgStyle = url => {
  if (!url) return {}

  const escaped = url.replace(/([\(\)])/g, (match, $1) => '\\' + $1)
  return {backgroundImage: `url(${escaped})`}
}

const GenericAvatar = ({ person: { id, avatar_url }, isLink, showPopover, showEdit }, { dispatch }) => {
  if (!id) return <span />

  const props = {
    className: 'avatar',
    style: bgStyle(avatar_url),
    onMouseOver: showPopover ? handleMouseOver(dispatch) : null
  }

  const edit = () => console.log('edit clicked on user id', id)

  return <div {...props}>
    {showEdit && <a className='edit-link' onClick={edit}>Change</a>}
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
