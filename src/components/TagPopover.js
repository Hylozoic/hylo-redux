import React from 'react'
import { connect } from 'react-redux'
import A from './A'
import Avatar from './Avatar'
import cx from 'classnames'
import { isEmpty, get } from 'lodash'
import { hideTagPopover, fetchTagSummary } from '../actions/index'
const { string, object, func, array, number } = React.PropTypes

const nounCount = (n, noun) => `${n} ${noun}${Number(n) !== 1 ? 's' : ''}`

@connect(({ tagPopover: { slug, tagName, position }, tagsByCommunity }) => {
  let tag = get(tagsByCommunity, [slug, tagName])
  return {
    tagName,
    slug,
    position,
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
    postCount: string,
    followerCount: number,
    activeMembers: array,
    position: object
  }

  hide () {
    let { dispatch } = this.props
    dispatch(hideTagPopover())
  }

  componentWillReceiveProps (nextProps) {
    let { dispatch, slug, tagName } = this.props
    if (isEmpty(nextProps.tagName)) return
    if (nextProps.tagName !== tagName || nextProps.slug !== slug) {
      dispatch(fetchTagSummary(nextProps.tagName, nextProps.slug))
    }
  }

  render () {
    let { tagName, description, postCount, followerCount, activeMembers, position } = this.props

    if (isEmpty(tagName)) return null

    return <div className={cx('popover')}
        style={{top: position.y, left: position.x}}
        ref='popover'
        onMouseLeave={() => this.hide()}>
        <div className='bottom-border'>
          <span className='tag-name'>#{tagName}</span>
          <span>{description}</span>
        </div>
        {activeMembers !== undefined
          ? <div className='bottom-border'>Most active members in this topic...</div>
          : <div className='bottom-border'>Loading...</div>}
        {activeMembers !== undefined && activeMembers.map(person =>
          <div className='bottom-border' key={person.id}>
            <Avatar person={person}/><A to={`/u/${person.id}`}><strong className='name'>{person.name}</strong></A>
            <span className='member-post-count'>
              {nounCount(person.post_count, 'post')}
            </span>
          </div>)}}
        <div className='bottom-border footer'>
          <A to={'follow'}>Follow Topic</A> |
          {followerCount && <span>{followerCount} following</span>}
          {postCount && <span>{nounCount(postCount, 'post')}</span>}
        </div>
      </div>
  }
}
