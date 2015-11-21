import { Link } from 'react-router'
import React from 'react'

const LeftNav = props => {
  return <nav id='leftNav'>
    <ul>
      <Link to='allPosts'>All posts</Link>
      <Link to='myPosts'>My posts</Link>
      <Link to='followedPosts'>Followed posts</Link>
      {props.communities.map((c, i) => <li key={i}>
        <Link to={`/c/${c.slug}`} activeClassName='active'>
          <img src={c.avatar_url}/>
          {c.name}
        </Link>
      </li>)}
    </ul>
  </nav>
}

export default LeftNav
