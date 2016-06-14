import React from 'react'
import { connect } from 'react-redux'
import A from './A'
import Avatar from './Avatar'
import cx from 'classnames'
import { isEmpty, get } from 'lodash'
import { hideTagPopover, fetchTagSummary, followTag } from '../actions/index'
const { string, object, func, array, number, bool } = React.PropTypes

const nounCount = (n, noun) => `${n} ${noun}${Number(n) !== 1 ? 's' : ''}`

@connect(({ tagPopover: { slug, tagName, position, anchorWidth }, tagsByCommunity }) => {
  let tag = get(tagsByCommunity, [slug, tagName])
  return {
    tagName,
    slug,
    position,
    anchorWidth,
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
    postCount: string,
    followerCount: string,
    activeMembers: array,
    position: object,
    anchorWidth: number,
    followed: bool
  }

  hide () {
    let { dispatch } = this.props
    dispatch(hideTagPopover())
  }

  removeHideTimeout () {
    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId)
      this.hideTimeoutId = null
    }
  }

  componentWillReceiveProps (nextProps) {
    let { dispatch, slug, tagName } = this.props

    // hidden
    if (isEmpty(nextProps.tagName)) return

    // loading
    if (nextProps.tagName !== tagName || nextProps.slug !== slug) {
      dispatch(fetchTagSummary(nextProps.tagName, nextProps.slug))
    }

    // content has loaded
    if (nextProps.description) {
      this.removeHideTimeout()
      this.hideTimeoutId = setTimeout(() => this.hide(), 3000)
    }
  }

  render () {
    let { slug, tagName, description, postCount, followerCount,
      activeMembers, position, anchorWidth, followed, dispatch } = this.props

    if (isEmpty(tagName)) return null

    const toggleFollow = () => dispatch(followTag(slug, tagName))
    const popoverHeight = 380
    const popoverWidth = 290
    let left = position.x - 25 + (anchorWidth / 2) - (popoverWidth / 2)
    if (left < 0) {
      left = 0
    } else if (left > document.documentElement.clientWidth - (popoverWidth + 30)) {
      left = document.documentElement.clientWidth - (popoverWidth + 30)
    }
    const above = position.y > popoverHeight + 70
    let outerPosition = {left}
    outerPosition.top = window.pageYOffset + position.y + 15
    let innerPosition = above ? {bottom: 5} : {}

    return <div className='popover-container'
        style={outerPosition}
        ref='popoverContainer'>
        <div className={cx('popover', above ? 'above' : 'below')}
          style={innerPosition}
          onMouseEnter={() => this.removeHideTimeout()}
          onMouseLeave={() => this.hide()}>
          <div className='bottom-border'>
            <span className='tag-name'># {tagName}</span>
            <span className='description meta-text'>{description}</span>
          </div>
          {activeMembers !== undefined
            ? <div className='bottom-border meta-text'>Most active members in this topic...</div>
            : <div className='bottom-border meta-text'>Loading...</div>}
          {activeMembers !== undefined && activeMembers.map(person =>
            <div className='bottom-border' key={person.id}>
              <Avatar person={person}/>
              <A to={`/u/${person.id}`} className='name'><strong>{person.name}</strong></A><br />
              <span className='member-post-count meta-text'>
                {nounCount(person.post_count, 'post')}
              </span>
            </div>)}
          <div className='footer'>
            <a onClick={toggleFollow}>{followed ? 'Unf' : 'F'}ollow Topic</a>
            {followerCount && <span>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;{followerCount} following</span>}
            {postCount && <span>&nbsp;&nbsp;&nbsp;{nounCount(postCount, 'post')}</span>}
          </div>
        </div>
      </div>
  }
}
