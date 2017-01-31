import React from 'react'
import { connect } from 'react-redux'
import A from './A'
import Avatar from './Avatar'
import { get } from 'lodash'
import { nounCount } from '../util/text'
import { navigate, fetchTagSummary, followTag } from '../actions'
const { string, func, array, number, bool } = React.PropTypes

@connect(({ tagsByCommunity }, { slug, tagName }) => {
  const tag = get(tagsByCommunity, [slug, tagName])
  return {
    tagName,
    slug,
    followed: get(tag, 'followed'),
    description: get(tag, 'description'),
    postCount: get(tag, 'post_count'),
    followerCount: get(tag, 'follower_count'),
    activeMembers: get(tag, 'active_members')
  }
})
export default class TagPopover extends React.Component {
  static propTypes = {
    dispatch: func,
    tagName: string,
    slug: string,
    description: string,
    postCount: number,
    followerCount: number,
    activeMembers: array,
    followed: bool
  }

  componentDidMount () {
    const { tagName, slug, dispatch } = this.props
    dispatch(fetchTagSummary(tagName, slug))
  }

  render () {
    const {
      slug, tagName, description, postCount, followerCount, activeMembers,
      followed, dispatch
    } = this.props

    const toggleFollow = () => dispatch(followTag(slug, tagName))

    return <span className='tag-popover'>
      <div>
        <a className='tag-name'
          onClick={() => dispatch(navigate(`/c/${slug}/tag/${tagName}`))}>
          #{tagName}
        </a>
        <span className='description meta-text'>{description}</span>
      </div>
      <div className='meta-text'>
        {activeMembers ? 'Most active members in this topic' : 'Loading...'}
      </div>
      {activeMembers && activeMembers.map(person => <div key={person.id}>
        <Avatar person={person} />
        <A to={`/u/${person.id}`} className='name'>
          <strong>{person.name}</strong>
        </A><br />
        <span className='member-post-count meta-text'>
          {nounCount(person.post_count, 'post')}
        </span>
      </div>)}
      <div className='footer'>
        <a onClick={toggleFollow}>{followed ? 'Unf' : 'F'}ollow Topic</a>
        {followerCount > 0 && <span>
          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;{followerCount} following
        </span>}
        {postCount > 0 && <span>
          &nbsp;&nbsp;&nbsp;{nounCount(postCount, 'post')}
        </span>}
      </div>
    </span>
  }
}
