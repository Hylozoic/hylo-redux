import React from 'react'
import { IndexLink, Link } from 'react-router'

export default function A (props) {
  return <Link activeClassName='active' {...props}>{props.children}</Link>
}

export const IndexA = props =>
  <IndexLink activeClassName='active' {...props}>{props.children}</IndexLink>
