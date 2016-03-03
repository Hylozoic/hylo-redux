import React from 'react'
import Avatar from './Avatar'
import { Link } from 'react-router'

const PersonDropdownItem = ({ person }) =>
  <li>
    <div>
      <Avatar person={person}/>
      <Link to={`/u/${person.id}`}>{person.name}</Link>
    </div>
  </li>

export default PersonDropdownItem
