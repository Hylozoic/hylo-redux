import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import ChangeImageButton from '../ChangeImageButton'

export default function Avatar ({ person, isLink, showEdit, showPopover, showPopoverHandler }) {
  if (!person) return <span />
  const { id, avatar_url } = person
  const props = {
    className: 'avatar',
    style: bgStyle(avatar_url),
    onMouseOver: showPopover ? showPopoverHandler : null
  }
  return <div {...props}>
    {showEdit && <ChangeImageButton person={person} type='avatar_url' />}
    {isLink && <Link to={`/u/${id}`}>&nbsp;</Link>}
  </div>
}
Avatar.propTypes = {
  person: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]).isRequired,
    avatar_url: PropTypes.string
  }).isRequired,
  isLink: PropTypes.bool,
  showEdit: PropTypes.bool,
  showPopover: PropTypes.bool,
  showPopoverHandler: PropTypes.func
}
Avatar.defaultProps = {
  isLink: true
}

const bgStyle = url => {
  if (!url) return {}
  const escaped = url.replace(/([\(\)])/g, (match, $1) => '\\' + $1) // eslint-disable-line
  return {backgroundImage: `url(${escaped})`}
}
