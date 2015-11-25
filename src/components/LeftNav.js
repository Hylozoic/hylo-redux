import { A } from './A'
import React from 'react'

const LeftNav = props => {
  return <nav id='leftNav'>
    <ul>
      <A to='/all-posts'>All posts</A>
      <A to='/my-posts'>My posts</A>
      <A to='/followed-posts'>Followed posts</A>
      {props.communities.map((c, i) => <li key={i}>
        <A to={`/c/${c.slug}`}>
          <img src={c.avatar_url}/>
          {c.name}
        </A>
      </li>)}
    </ul>
  </nav>
}

export default LeftNav
