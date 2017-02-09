import React from 'react'
import Icon from '../../components/Icon'
import A from '../../components/A'
import Modal from '../../components/Modal'
import { isEmpty, some } from 'lodash'
import { find } from 'lodash/fp'
import { same } from '../../models'
import { humanDate } from '../../util/text'
import { tagUrl, userUrl } from '../../routes'
import { trackEvent, FOLLOWED_TOPIC } from '../../util/analytics'
const { array, bool, func, number, object, string } = React.PropTypes

export default class BrowseTopicsModal extends React.Component {
  static propTypes = {
    fetchTags: func,
    followTag: func,
    tags: array,
    community: object.isRequired,
    pending: bool,
    total: number,
    followedTags: array,
    onCancel: func,
    onboarding: bool,
    nextUrl: string
  }

  componentDidMount () {
    const { community, actions } = this.props
    actions.fetchTags(community)
  }

  loadMore = () => {
    const { community, tags, actions } = this.props
    actions.fetchTags(community, tags.length)
  }

  toggleFollow = (name, togglingOn) => {
    const { onboarding, community: { slug }, actions } = this.props
    if (togglingOn) {
      trackEvent(FOLLOWED_TOPIC, {
        tag: name,
        context: onboarding ? 'onboarding' : 'modal'
      })
    }
    return actions.followTag(slug, name)
  }

  render () {
    const {
      tags, community, pending, total, followedTags, onCancel, onboarding,
      nextUrl
    } = this.props
    const offset = tags ? tags.length : 0
    const title = onboarding
      ? 'What are you interested in?'
      : (total ? `Browse all ${total} topics` : 'Browse all topics')

    const subtitle = onboarding
      ? `Follow the topics you're interested in to join the conversation with other members.`
      : null

    const hasMore = !pending && offset < total

    return <Modal {...{title, subtitle}} id='browse-all-topics' onCancel={onCancel}
      standalone={onboarding}>
      {isEmpty(tags) ? <div className='loading'>Loading...</div>
        : <ul>
          {tags.map(tag => {
            const followed = some(followedTags, same('name', tag))
            return <TagRow tag={tag} community={community} key={tag.id}
              followed={followed}
              onboarding={onboarding}
              onClick={onCancel}
              onFollow={this.toggleFollow} />
          })}
          {hasMore && <li className='show-more'>
            <span className='meta'>
              Showing {tags.length} of {total}.&nbsp;
              <a onClick={this.loadMore}>Show more</a>
            </span>
          </li>}
        </ul>}
      {onboarding && <div className='footer'>
        <A className='button' to={nextUrl}>Next</A>
      </div>}
    </Modal>
  }
}

const TagRow = ({ tag, community, followed, onClick, onFollow }, { isMobile }) => {
  const { id, name } = tag
  const { slug } = community
  const membership = find(m => same('id', community), tag.memberships)
  const { description, follower_count, owner, created_at } = membership
  const controls = <TagRowControls {...{follower_count, followed, name, onFollow}} />

  return <li key={id}>
    {!isMobile && controls}
    <A className='name' to={tagUrl(name, slug)} onClick={onClick}># {name}</A>
    {description && <p className='description'>
      {description}
    </p>}
    {!isEmpty(owner) && <span className='meta'>
      created by <A to={userUrl(owner)}>{owner.name}</A> {humanDate(created_at)}
    </span>}
    {isMobile && controls}
  </li>
}
TagRow.contextTypes = {isMobile: bool, dispatch: func}

const TagRowControls = ({ followed, follower_count, name, onFollow }) => {
  return <div className='right'>
    <span className='followers'>
      <Icon name='Users' />
      <span className='count'>{follower_count}</span>
    </span>
    {followed
      ? <a className='unfollow button' onClick={() => onFollow(name)}>
        Unfollow <span className='x'>&times;</span>
      </a>
      : <a className='follow button' onClick={() => onFollow(name, true)}>
        <span>+</span> Follow
      </a>}
  </div>
}
TagRowControls.contextTypes = {dispatch: func}
