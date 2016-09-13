import React from 'react'
import { connect } from 'react-redux'
import A from './A'
import Avatar from './Avatar'
import cx from 'classnames'
import { get } from 'lodash'
import { tagUrlComponents } from '../routes'
import { position } from '../util/scrolling'
import { nounCount } from '../util/text'
import { showTagPopover, hideTagPopover, fetchTagSummary, navigate } from '../actions/index'
import { followTag } from '../actions/tags'
const { string, object, func, array, number, bool } = React.PropTypes

let canceledPopover

export const handleMouseOver = dispatch => event => {
  var node = event.target

  if (node.nodeName.toLowerCase() === 'a' && node.getAttribute('class') === 'hashtag') {
    canceledPopover = false

    const cancel = () => {
      canceledPopover = true
      node.removeEventListener('mouseleave', cancel)
    }
    node.addEventListener('mouseleave', cancel)

    const { tagName, slug } = tagUrlComponents(node.getAttribute('href'))
    setTimeout(() => {
      if (!canceledPopover) dispatch(showTagPopover(tagName, slug, node))
    }, 500)
  }
}

@connect(({ tagsByCommunity }, { tagPopover: { slug, tagName, node } }) => {
  const tag = get(tagsByCommunity, [slug, tagName])
  return {
    tagName,
    slug,
    node,
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
    node: object,
    followed: bool
  }

  componentDidMount () {
    const { tagName, slug, dispatch, node } = this.props
    dispatch(fetchTagSummary(tagName, slug))
    node.addEventListener('mouseleave', this.startHide)
  }

  startHide = () => {
    this.shouldHide = true
    setTimeout(() => this.shouldHide && this.hide(), 400)
  }

  cancelHide = () => {
    if (this.shouldHide) this.shouldHide = false
  }

  hide = () => {
    this.props.dispatch(hideTagPopover())
    this.props.node.removeEventListener('mouseleave', this.startHide)
  }

  calculateStyle () {
    const { node } = this.props
    const pos = position(node)
    const rect = node.getBoundingClientRect()
    const popoverHeight = 380
    const popoverWidth = 280
    const pageMargin = 20
    const maxLeft = document.documentElement.clientWidth - popoverWidth - pageMargin
    const centerOnLink = pos.x + rect.width / 2 - popoverWidth / 2
    const left = Math.max(pageMargin, Math.min(centerOnLink, maxLeft))
    const above = rect.top > popoverHeight + 70

    return {
      above,
      outer: {left, top: pos.y + (above ? -30 : rect.height)},
      inner: {[above ? 'bottom' : 'top']: 15}
    }
  }

  render () {
    const {
      slug, tagName, description, postCount, followerCount, activeMembers,
      followed, dispatch
    } = this.props

    const toggleFollow = () => dispatch(followTag(slug, tagName))
    const { above, outer, inner } = this.calculateStyle()

    return <div className='popover-container' style={outer}
      onMouseMove={this.cancelHide} onMouseLeave={this.hide}>
      <div className={cx('popover', above ? 'above' : 'below')} style={inner}>
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
          <Avatar person={person}/>
          <A to={`/u/${person.id}`} className='name'>
            <strong>{person.name}</strong>
          </A><br />
          <span className='member-post-count meta-text'>
            {nounCount(person.post_count, 'post')}
          </span>
        </div>)}
        <div className='footer'>
          <a onClick={toggleFollow}>{followed ? 'Unf' : 'F'}ollow Topic</a>
          {followerCount && <span>
            &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;{followerCount} following
          </span>}
          {postCount && <span>
            &nbsp;&nbsp;&nbsp;{nounCount(postCount, 'post')}
          </span>}
        </div>
      </div>
    </div>
  }
}
