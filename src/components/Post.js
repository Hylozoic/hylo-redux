import React from 'react'
import { difference, first, includes, map, some, sortBy, reject } from 'lodash'
import { find, filter, get } from 'lodash/fp'
const { array, bool, func, object, string } = React.PropTypes
import cx from 'classnames'
import cheerio from 'cheerio'
import {
  humanDate, nonbreaking, present, textLength, truncate, appendInP
} from '../util/text'
import { sanitize } from 'hylo-utils/text'
import { linkifyHashtags } from '../util/linkify'
import { tagUrl } from '../routes'
import A from './A'
import Avatar from './Avatar'
import Dropdown from './Dropdown'
import Attachments from './Attachments'
import { ClickCatchingSpan } from './ClickCatcher'
import { handleMouseOver } from './TagPopover'
import LazyLoader from './LazyLoader'
import Icon from './Icon'
import LinkedPersonSentence from './LinkedPersonSentence'
import LinkPreview from './LinkPreview'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { navigate, showModal } from '../actions'
import {
  completePost, followPost, removePost, startPostEdit, voteOnPost, pinPost
} from '../actions/posts'
import { typeahead } from '../actions'
import { same } from '../models'
import { denormalizedPost, getComments, isPinned } from '../models/post'
import { getCurrentCommunity } from '../models/community'
import { canEditPost, canModerate, hasFeature } from '../models/currentUser'
import { CONTRIBUTORS } from '../config/featureFlags'
import { isMobile } from '../client/util'
import decode from 'ent/decode'
import CommentSection from './CommentSection'
import TagInput from './TagInput'

const spacer = <span>&nbsp; •&nbsp; </span>

export const presentDescription = (post, community, opts = {}) =>
  present(sanitize(post.description), {slug: get('slug', community), ...opts})

export class Post extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      requestCompleting: false,
      contributors: []
    }
  }

  static propTypes = {
    post: object,
    community: object,
    comments: array,
    dispatch: func,
    expanded: bool,
    onExpand: func,
    commentId: string
  }

  static contextTypes = {currentUser: object}

  static childContextTypes = {post: object}

  getChildContext () {
    return {post: this.props.post}
  }

  render () {
    let  { post } = this.props
    const { comments, expanded, onExpand, community, dispatch, contributorChoices } = this.props
    const { contributors } = this.state
    const { currentUser } = this.context
    const { communities, tag, media, linkPreview } = post
    const image = find(m => m.type === 'image', media)
    const classes = cx('post', tag, {image, expanded})
    const title = linkifyHashtags(decode(sanitize(post.name || '')), get('slug', community))

    const canEdit = canEditPost(currentUser, post)

    const isRequest = post.tag === 'request'
    const isCompleteRequest = isRequest && post.fulfilled_at
    const isIncompleteRequest = isRequest && !post.fulfilled_at && canEdit
    const toggleRequestCompleting = () => {
      return this.setState({requestCompleting: !this.state.requestCompleting})
    }
    const addContributor = (person) => {
      this.setState({contributors: [...this.state.contributors, person]})
    }
    const removeContributor = (person) => {
      this.setState({contributors: reject(this.state.contributors, {id: person.id})})
    }
    const contributorHandleInput = (term) => {
      dispatch(typeahead(term, 'invite', {communityId: community.id, type: 'people'}))
    }
    const completeRequest = () => {
      if(contributors.length > 0) {
        dispatch(completePost(post.id, contributors))
      }
    }

    return <div className={classes}>
      <a name={`post-${post.id}`}></a>
      <Header communities={communities} expanded={expanded}/>
      <p className='title post-section' dangerouslySetInnerHTML={{__html: title}}></p>
      {image && <LazyLoader>
        <img src={image.url} className='post-section full-image'/>
      </LazyLoader>}
      <Details {...{expanded, onExpand}}/>
      {linkPreview && <LinkPreview {...{linkPreview}}/>}
      <div className='voting post-section'>
        <VoteButton/>
        <Voters/>
      </div>
      <Attachments/>
      {hasFeature(currentUser, CONTRIBUTORS) && isCompleteRequest &&
        <div className='request-completed-bar'>
          <div className='request-complete-heading'>
            <input className='toggle'
              type='checkbox'
              checked={!!post.fulfilled_at}
              readOnly={!canEdit} />
            <Contributors />
          </div>
        </div>
      }
      <CommentSection {...{post, expanded, onExpand, comments}}/>
      {hasFeature(currentUser, CONTRIBUTORS) && isIncompleteRequest &&
        <div className='request-completed-bar'>
          <div className='request-complete-heading'>
            <input type='checkbox'
              className='toggle'
              checked={this.state.requestCompleting}
              onChange={toggleRequestCompleting} />
            <p className='request-complete-message'>
              { this.state.requestCompleting ?
                  'Awesome! Who helped you?' :
                  'Click the checkmark if your request has been completed!' }
            </p>
          </div>
          {this.state.requestCompleting &&
            <div className='buttons'>
              <a className='cancel' onClick={toggleRequestCompleting}>
                <span className='icon icon-Fail'></span>
              </a>
              <TagInput className='request-complete-people-input'
                choices={contributorChoices}
                handleInput={contributorHandleInput}
                onSelect={addContributor}
                onRemove={removeContributor}
                tags={contributors} />
              <a className='done' onClick={completeRequest}>
                Done
              </a>
            </div>
          }
        </div>
      }
    </div>
  }
}

export default compose(connect((state, {post}) => {
  return {
    comments: getComments(post, state),
    community: getCurrentCommunity(state),
    post: denormalizedPost(post, state),
    contributorChoices: reject(
      state.typeaheadMatches.invite, {id: post.user_id}
    )
  }
}))(Post)

export const UndecoratedPost = Post // for testing

export const Header = ({ communities, expanded }, { post, currentUser, dispatch }) => {
  const { tag, fulfilled_at } = post
  const person = tag === 'welcome' ? post.relatedUsers[0] : post.user
  const createdAt = new Date(post.created_at)
  const canEdit = canEditPost(currentUser, post)
  const showCheckbox = !hasFeature(currentUser, CONTRIBUTORS) &&
    post.tag === 'request' && (canEdit || fulfilled_at)

  return <div className='header'>
    <Menu expanded={expanded}/>
    <Avatar person={person}/>
    {showCheckbox && <input type='checkbox'
      className='completion-toggle'
      checked={!!post.fulfilled_at}
      onChange={() => canEdit && dispatch(completePost(post.id))}
      readOnly={!canEdit}/>}
    {tag === 'welcome'
      ? <WelcomePostHeader communities={communities}/>
      : <div>
          <A className='name' to={`/u/${person.id}`}>{person.name}</A>
          <span className='meta'>
            <A to={`/p/${post.id}`} title={createdAt}>
              {nonbreaking(humanDate(createdAt))}
            </A>
            {communities && <Communities communities={communities}/>}
            {post.public && <span>{spacer}Public</span>}
          </span>
        </div>}
  </div>
}
Header.contextTypes = {post: object, currentUser: object, dispatch: func}

const Communities = ({ communities }, { community }) => {
  if (community) communities = sortBy(communities, c => c.id !== community.id)
  const { length } = communities
  if (communities.length === 0) return null

  const communityLink = community => <A to={`/c/${community.slug}`}>{community.name}</A>
  return <span className='communities'>
    &nbsp;in {communityLink(communities[0])}
    {length > 1 && <span> + </span>}
    {length > 1 && <Dropdown className='post-communities-dropdown'
      toggleChildren={<span>{length - 1} other{length > 2 ? 's' : ''}</span>}>
      {communities.slice(1).map(c => <li key={c.id}>{communityLink(c)}</li>)}
    </Dropdown>}
  </span>
}
Communities.contextTypes = {community: object}

const getTags = text =>
  cheerio.load(text)('.hashtag').toArray().map(tag =>
    tag.children[0].data.replace(/^#/, ''))

const extractTags = (shortDesc, fullDesc, omitTag) => {
  const tags = filter(t => t !== omitTag, getTags(fullDesc))
  return tags.length === 0 ? [] : difference(tags, getTags(shortDesc))
}

const HashtagLink = ({ tag, slug }, { dispatch }) => {
  const onMouseOver = handleMouseOver(dispatch)
  return <a className='hashtag' href={tagUrl(tag, slug)} {...{onMouseOver}}>
    {`#${tag}`}
  </a>
}
HashtagLink.contextTypes = {dispatch: func}

export const Details = ({ expanded, onExpand }, { post, community, dispatch }) => {
  const truncatedSize = 300
  const { tag } = post
  if (!community) community = post.communities[0]
  const slug = get('slug', community)
  let description = presentDescription(post, community)
  let extractedTags = []
  const truncated = !expanded && textLength(description) > truncatedSize
  if (truncated) {
    const orig = description
    description = truncate(description, truncatedSize)
    extractedTags = extractTags(description, orig, tag)
  }
  if (description) description = appendInP(description, '&nbsp;')

  return <div className='post-section details'>
    <ClickCatchingSpan dangerouslySetInnerHTML={{__html: description}}/>
    {truncated && <span>
      <wbr/>
      <a onClick={() => onExpand(null)} className='show-more'>Show&nbsp;more</a>
      &nbsp;
    </span>}
    {extractedTags.map(tag => <span key={tag}>
      <wbr/>
      <HashtagLink tag={tag} slug={slug}/>
      &nbsp;
    </span>)}
    {tag && <HashtagLink tag={tag} slug={slug}/>}
  </div>
}
Details.contextTypes = {post: object, community: object, dispatch: func}

const WelcomePostHeader = ({ communities }, { post }) => {
  let person = post.relatedUsers[0]
  let community = communities[0]
  return <div>
    <strong><A to={`/u/${person.id}`}>{person.name}</A></strong> joined
    <span> </span>
    {community
      ? <span>
          <A to={`/c/${community.slug}`}>{community.name}</A>.
          <span> </span>
          <a className='open-comments'>
            Welcome them!
          </a>
        </span>
      : <span>
          a community that is no longer active.
        </span>}
  </div>
}
WelcomePostHeader.contextTypes = {post: object}

export const Menu = (props, { dispatch, post, currentUser, community }) => {
  const canEdit = canEditPost(currentUser, post)
  const following = some(post.follower_ids, id => id === get('id', currentUser))
  const pinned = isPinned(post, community)
  const edit = () => isMobile()
    ? dispatch(navigate(`/p/${post.id}/edit`))
    : dispatch(startPostEdit(post)) &&
      props.expanded && dispatch(showModal('post-editor', {post}))
  const remove = () => window.confirm('Are you sure? This cannot be undone.') &&
    dispatch(removePost(post.id))
  const pin = () => dispatch(pinPost(get('slug', community), post.id))

  const toggleChildren = pinned
    ? <span className='pinned'><span className='label'>Pinned</span><span className='icon-More'></span></span>
    : <span className='icon-More'></span>

  return <Dropdown className='post-menu' alignRight {...{toggleChildren}}>
    {canModerate(currentUser, community) && <li>
      <a onClick={pin}>{pinned ? 'Unpin post' : 'Pin post'}</a>
    </li>}
    {canEdit && <li><a className='edit' onClick={edit}>Edit</a></li>}
    {canEdit && <li><a onClick={remove}>Remove</a></li>}
    <li>
      <a onClick={() => dispatch(followPost(post.id, currentUser))}>
        Turn {following ? 'off' : 'on'} notifications for this post
      </a>
    </li>
    <li>
      <a onClick={() => window.alert('TODO')}>Report objectionable content</a>
    </li>
  </Dropdown>
}
Menu.contextTypes = {post: object, currentUser: object, dispatch: func, community: object}

export const VoteButton = (props, { post, currentUser, dispatch }) => {
  let vote = () => dispatch(voteOnPost(post, currentUser))
  let myVote = includes(map(post.voters, 'id'), (currentUser || {}).id)
  return <a className='vote-button' onClick={vote}>
    {myVote ? <Icon name='Heart2' /> : <Icon name='Heart' />}
    {myVote ? 'Liked' : 'Like'}
  </a>
}
VoteButton.contextTypes = {post: object, currentUser: object, dispatch: func}

export const Voters = (props, { post, currentUser }) => {
  const voters = post.voters || []

  let onlyAuthorIsVoting = voters.length === 1 && same('id', first(voters), post.user)
  return voters.length > 0 && !onlyAuthorIsVoting
    ? <LinkedPersonSentence people={voters} className='voters meta'>
        liked this.
      </LinkedPersonSentence>
    : <span />
}
Voters.contextTypes = {post: object, currentUser: object}

export const Contributors = (props, { post, currentUser }) => {
  const contributors = post.contributors || []

  let onlyAuthorIsContributing = contributors.length === 1 && same('id', first(contributors), post.user)
  return contributors.length > 0 && !onlyAuthorIsContributing
    ? <LinkedPersonSentence people={contributors} className='contributors'>
        helped complete this request!
      </LinkedPersonSentence>
    : <span />
}
Contributors.contextTypes = {post: object, currentUser: object}
