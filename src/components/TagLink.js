import React from 'react'
import { tagUrl } from '../routes'
import A from './A'
import Avatar from './Avatar'
import cx from 'classnames'
const { string } = React.PropTypes

const nounCount = (n, noun) => {
  `${n} ${noun}${n !== 1 && 's'}`
}

const dummyData = {
  description: 'The woo channel is a little old place where we can get together',
  post_count: 58,
  follower_count: 150,
  active_members: [
    {name: 'Damian Madray', id: 16264, avatar_url: 'http://graph.facebook.com/10156248948240099/picture?type=large', post_count: 12},
    {name: 'Edward West', id: 21, avatar_url: 'https://d3ngex8q79bk55.cloudfront.net/user/21/avatar/1456875657890_EdwardHeadshot2016Square.jpg', post_count: 11},
    {name: 'Julia Pope', id: 16325, avatar_url: 'http://graph.facebook.com/10153642256837626/picture?type=large', post_count: 9}
  ]
}

export default class TagLink extends React.Component {
  static propTypes = {
    tagName: string,
    slug: string
  }

  constructor (props) {
    super(props)
    this.state = {hidden: true}
  }

  showPopover () {
    this.setState({hidden: false})
  }

  hidePopover () {
    this.setState({hidden: true})
  }

  render () {
    let { tagName, slug } = this.props
    let { hidden } = this.state

    let { description, post_count, follower_count, active_members } = dummyData

    return <span
      onMouseOver={() => this.showPopover()}
      onMouseOut={() => this.hidePopover()}>
      <A to={tagUrl(tagName, slug)} className='hashtag'>#{tagName}</A>
      <div className={cx('popover', {hidden})} ref='popover'>
        <div className='bottom-border'>
          <span className='tag-name'>#{tagName}</span>
          <span>{description}</span>
        </div>
        <div className='bottom-border'>
          Most active members in this topic...
        </div>
        {active_members.map(person =>
          <div className='bottom-border' key={person.id}>
            <Avatar person={person}/><A to={`/u/${person.id}`}><strong className='name'>${person.name}</strong></A>
            <span className='member-post-count'>
              {nounCount(person.post_count, 'post')}
            </span>
          </div>)}
        <div className='bottom-border footer'>
          <A to={'follow'}>Follow Topic</A> |
          <span>{follower_count} following</span>
          <span>{nounCount(post_count, 'post')}</span>
        </div>
      </div>
    </span>
  }
}
