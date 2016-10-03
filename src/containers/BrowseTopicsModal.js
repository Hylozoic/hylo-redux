import React from 'react'
import { connect } from 'react-redux'
import { getCurrentCommunity, getFollowedTags } from '../models/community'
import { connectedListProps } from '../util/caching'
import { closeModal } from '../actions'
import { fetchTags, followTag } from '../actions/tags'
import ScrollListener from '../components/ScrollListener'
import Icon from '../components/Icon'
import A from '../components/A'
import { modalWrapperCSSId, Modal } from '../components/Modal'
import { isEmpty, some } from 'lodash'
import { find } from 'lodash/fp'
import { same } from '../models'
import { denormalizedCurrentUser, newestMembership } from '../models/currentUser'
import { humanDate } from '../util/text'
import { tagUrl, userUrl } from '../routes'
const { array, bool, func, number, object, string } = React.PropTypes

const subject = 'community'

@connect((state, props) => {
  const community = props.community || getCurrentCommunity(state) ||
    newestMembership(denormalizedCurrentUser(state)).community
  return {
    community,
    ...connectedListProps(state, {subject, id: community.slug}, 'tags'),
    followedTags: getFollowedTags(community, state)
  }
})
export default class BrowseTopicsModal extends React.Component {
  static propTypes = {
    dispatch: func,
    tags: array,
    community: object,
    pending: bool,
    total: number,
    followedTags: array,
    onCancel: func,
    onboarding: bool,
    nextUrl: string
  }

  componentDidMount () {
    const { dispatch, community } = this.props
    dispatch(fetchTags({subject, id: community.slug}))
  }

  render () {
    const {
      tags, community, dispatch, pending, total, followedTags, onCancel,
      onboarding, nextUrl
    } = this.props
    const offset = tags.length
    const title = onboarding
      ? 'What are you interested in?'
      : (total ? `Browse all ${total} topics` : 'Browse all topics')

    const subtitle = onboarding
      ? `Follow the topics you're interested in to join the conversation with other members.`
      : null

    const loadMore = !pending && offset < total
      ? () => dispatch(fetchTags({subject, id: community.slug, offset}))
      : () => {}

    const scrollListenerProps = {
      onBottom: loadMore,
      elementId: onboarding ? null : modalWrapperCSSId
    }

    return <Modal {...{title, subtitle}} id='browse-all-topics' onCancel={onCancel}
      standalone={onboarding}>
      {isEmpty(tags) ? <div className='loading'>Loading...</div>
        : <ul>
            {tags.map(tag => {
              const followed = some(followedTags, same('name', tag))
              return <TagRow tag={tag} community={community} key={tag.id}
                followed={followed}/>
            })}
          </ul>}
      <ScrollListener {...scrollListenerProps}/>
      {onboarding && <div className='footer'>
        <A className='button' to={nextUrl}>Next</A>
      </div>}
    </Modal>
  }
}

const TagRow = ({ tag, community, followed }, { isMobile, dispatch }) => {
  const { id, name, post_type } = tag
  const { slug } = community
  const membership = find(m => same('id', community), tag.memberships)
  const { description, follower_count, owner, created_at } = membership
  const close = () => dispatch(closeModal())

  return <li key={id}>
    {!isMobile && <TagRowControls {...{follower_count, slug, followed, name}}/>}
    <A className='name' to={tagUrl(name, slug)} onClick={close}># {name}</A>
    {(description || post_type) && <p className='description'>
      {description || post_type}
    </p>}
    {!isEmpty(owner) && <span className='meta'>
      created by <A to={userUrl(owner)}>{owner.name}</A> {humanDate(created_at)}
    </span>}
    {isMobile && <TagRowControls {...{follower_count, slug, followed, name}}/>}
  </li>
}
TagRow.contextTypes = {isMobile: bool, dispatch: func}

const TagRowControls = ({ followed, follower_count, slug, name }, { dispatch }) => {
  const follow = () => dispatch(followTag(slug, name))
  return <div className='right'>
    <span className='followers'>
      <Icon name='Users'/>
      <span className='count'>{follower_count}</span>
    </span>
    {followed
      ? <a className='unfollow button' onClick={follow}>
          Unfollow <span className='x'>&times;</span>
        </a>
      : <a className='follow button' onClick={follow}>
          <span>+</span> Follow
        </a>}
  </div>
}
TagRowControls.contextTypes = {dispatch: func}
