import React from 'react'
import { connect } from 'react-redux'
import A from './A'
import Avatar from './Avatar'
import cx from 'classnames'
import { isEmpty } from 'lodash'
import { hideTagPopover } from '../actions/index'
const { string, object, func } = React.PropTypes

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

@connect(({ tagPopover }) => tagPopover)
export default class TagPopover extends React.Component {

  static propTypes = {
    dispatch: func,
    tagName: string,
    slug: string,
    position: object
  }

  hide () {
    let { dispatch } = this.props
    dispatch(hideTagPopover())
  }

  render () {
    let { tagName, slug } = this.props
    console.log('tag popo props ', this.props)

    let { description, post_count, follower_count, active_members } = dummyData

    if (isEmpty(tagName)) return null

    return <div className={cx('popover')}
        onMouseLeave={() => this.hide()}>
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
  }
}
