/* eslint-disable camelcase */
// LEJ: This is all the react component business
//      everything comes in through a prop and
//      using dispatch in this file should be considered
//      a code smell.
import React from 'react'
import { difference, first, includes, map, some, sortBy, reject } from 'lodash'
import { find, filter, get } from 'lodash/fp'
const { array, bool, func, object, string } = React.PropTypes
import cx from 'classnames'
import cheerio from 'cheerio'
import decode from 'ent/decode'
import {
  humanDate, nonbreaking, present, textLength, truncate, appendInP
} from '../../util/text'
import { sanitize } from 'hylo-utils/text'
import { linkifyHashtags } from '../../util/linkify'
import { tagUrl } from '../../routes'
import { isMobile } from '../../client/util'
import { same } from '../../models'
import { isPinned } from '../../models/post'
import { canEditPost, canModerate, hasFeature } from '../../models/currentUser'
import { CONTRIBUTORS } from '../../config/featureFlags'
import CommentSection from '../CommentSection'
import TagInput from '../TagInput'
import LinkedPersonSentence from '../LinkedPersonSentence'
import LinkPreview from '../LinkPreview'
import A from '../A'
import Avatar from '../Avatar'
import Dropdown from '../Dropdown'
import Attachments from '../Attachments'
import LazyLoader from '../LazyLoader'
import Icon from '../Icon'
import { ClickCatchingSpan } from '../ClickCatcher'

const spacer = <span>&nbsp; •&nbsp; </span>

export const presentDescription = (post, community, opts = {}) =>
  present(sanitize(post.description), {slug: get('slug', community), ...opts})

export default class Post extends React.Component {
  constructor (props, context) {
    super(props, context)
    this.state = {
      requestCompleting: false,
      contributors: []
    }
  }

  static propTypes = {
    post: object,
    actions: object,
    community: object,
    comments: array,
    expanded: bool,
    onExpand: func,
    commentId: string
  }

  static contextTypes = {currentUser: object}

  static childContextTypes = { post: object }

  getChildContext () {
    return {post: this.props.post}
  }

  render () {
    let { post, comments } = this.props
    const {
      actions, expanded, onExpand, community,
      contributorChoices, personPopoverOnMouseOver
    } = this.props
    if (post.project) {
      comments = comments.slice(-1)
    }
    const { contributors, requestCompleting } = this.state
    const { currentUser } = this.context
    const { communities, tag, media, linkPreview, project } = post
    const image = find(m => m.type === 'image', media)
    const classes = cx('post', tag, {image, expanded})
    const title = linkifyHashtags(decode(sanitize(post.name || '')), get('slug', community))

    const canEdit = canEditPost(currentUser, post)

    const isRequest = tag === 'request'
    const isCompleteRequest = isRequest && post.fulfilled_at
    const isIncompleteRequest = isRequest && !post.fulfilled_at && canEdit
    const addContributor = (person) => {
      this.setState({contributors: [...contributors, person]})
    }
    const removeContributor = (person) => {
      this.setState({contributors: reject(contributors, {id: person.id})})
    }
    const handleContributorInput = (term) => {
      actions.typeahead(term, 'contributors', {
        type: 'people', communityIds: post.community_ids }
      )
    }
    const toggleRequestCompleting = () => this.setState({requestCompleting: !requestCompleting})
    const toggleRequestComplete = () => {
      if (isCompleteRequest) {
        if (window.confirm('This will mark this request as Incomplete. Are you sure?')) {
          actions.completePost(post.id)
        }
      } else {
        if (contributors.length > 0) this.setState({contributors: []})
        toggleRequestCompleting()
        actions.completePost(post.id, contributors)
      }
    }

    return <div className={classes}>
      <a name={`post-${post.id}`} />
      <Header {...{ post, communities, project, expanded, actions, personPopoverOnMouseOver }} />
      <p className='title post-section' dangerouslySetInnerHTML={{__html: title}} />
      {image && <LazyLoader>
        <img src={image.url} className='post-section full-image' />
      </LazyLoader>}
      <Details {...{post, expanded, onExpand, personPopoverOnMouseOver}} />
      {linkPreview && <LinkPreview {...{linkPreview}} />}
      <div className='voting post-section'>
        <VoteButton post={post} actions={actions} />
        <Voters post={post} />
      </div>
      <Attachments />
      {hasFeature(currentUser, CONTRIBUTORS) && isCompleteRequest &&
        <div className='request-completed-bar'>
          <div className='request-complete-heading'>
            <div className='request-complete-message'>
              <input className='toggle'
                type='checkbox'
                checked={!!post.fulfilled_at}
                readOnly={!canEdit}
                onChange={toggleRequestComplete} />
              <RequestContributorsSentence post={post} />
            </div>
          </div>
        </div>
      }
      <CommentSection {...{post, expanded, onExpand, comments}} />
      {hasFeature(currentUser, CONTRIBUTORS) && isIncompleteRequest &&
        <div className='request-completed-bar'>
          <div className='request-complete-heading'>
            <div className='request-complete-message'>
              <input type='checkbox'
                className='toggle'
                checked={requestCompleting}
                onChange={toggleRequestCompleting} />
              <p>
                {requestCompleting
                  ? 'Awesome! Who helped you?'
                  : 'Click the checkmark if this request has been completed!'}
              </p>
            </div>
          </div>
          {requestCompleting &&
            <div className='buttons'>
              <a className='cancel' onClick={toggleRequestCompleting}>
                <span className='icon icon-Fail' />
              </a>
              <TagInput className='request-complete-people-input'
                choices={contributorChoices}
                handleInput={handleContributorInput}
                onSelect={addContributor}
                onRemove={removeContributor}
                tags={contributors} />
              <a className='done' onClick={toggleRequestComplete}>
                Done
              </a>
            </div>
          }
        </div>
      }
    </div>
  }
}

export const Header = ({ post, project, communities, expanded, actions, personPopoverOnMouseOver }) => {
  const { tag } = post
  const person = tag === 'welcome' ? post.relatedUsers[0] : post.user
  const createdAt = new Date(post.created_at)

  return <div className='header'>
    <Menu expanded={expanded} post={post} actions={actions} />
    <Avatar person={person} showPopover />
    {tag === 'welcome'
      ? <WelcomePostHeader post={post} communities={communities} />
      : <div onMouseOver={personPopoverOnMouseOver}>
        <A className='name' to={`/u/${person.id}`}>
          {person.name}
        </A>
        <span className='meta'>
          <A to={`/p/${post.id}`} title={createdAt}>
            {nonbreaking(humanDate(createdAt))}
          </A>
          {communities && <Communities communities={communities} project={project} />}
          {post.public && <span>{spacer}Public</span>}
        </span>
      </div>}
  </div>
}

const Communities = ({ communities, project }, { community }) => {
  if (community) communities = sortBy(communities, c => c.id !== community.id)
  const { length } = communities
  if (communities.length === 0) return null

  const communityLink = community => <A to={`/c/${community.slug}`}>{community.name}</A>
  const projectLink = project => <span>
    <A to={`/p/${project.id}`} className='project-link'>{project.name}</A>
    {spacer}
  </span>

  return <span className='communities'>
    &nbsp;in&nbsp;
    {project && projectLink(project)}
    {communityLink(communities[0])}
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

const HashtagLink = ({ tag, slug, personPopoverOnMouseOver }) => {
  const onMouseOver = personPopoverOnMouseOver
  return <a className='hashtag' href={tagUrl(tag, slug)} {...{onMouseOver}}>
    {`#${tag}`}
  </a>
}

export const Details = ({ post, expanded, onExpand, personPopoverOnMouseOver }, { community }) => {
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
    <ClickCatchingSpan dangerouslySetInnerHTML={{__html: description}} />
    {truncated && <span>
      <wbr />
      <a onClick={() => onExpand(null)} className='show-more'>Show&nbsp;more</a>
      &nbsp;
    </span>}
    {extractedTags.map(tag => <span key={tag}>
      <wbr />
      <HashtagLink {...{ tag, slug, personPopoverOnMouseOver }} />
      &nbsp;
    </span>)}
    {tag && <HashtagLink tag={tag} slug={slug} />}
  </div>
}
Details.contextTypes = {community: object}

const WelcomePostHeader = ({ post, communities }) => {
  let person = post.relatedUsers[0]
  let community = communities[0]
  return <div>
    <strong><A to={`/u/${person.id}`}>{person.name}</A></strong> joined
    <span />
    {community
      ? <span>
        <A to={`/c/${community.slug}`}>{community.name}</A>.
        <span />
        <a className='open-comments'>
          Welcome them!
        </a>
      </span>
    : <span>
        a community that is no longer active.
      </span>}
  </div>
}

export const Menu = ({ post, actions, expanded }, { currentUser, community }) => {
  const canEdit = canEditPost(currentUser, post)
  const following = some(post.follower_ids, id => id === get('id', currentUser))
  const pinned = isPinned(post, community)
  const edit = () => isMobile()
    ? actions.navigate(`/p/${post.id}/edit`)
    : actions.startPostEdit(post) &&
      expanded && actions.showModal('post-editor', {post})
  const remove = () => window.confirm('Are you sure? This cannot be undone.') &&
    actions.removePost(post.id)
  const pin = () => actions.pinPost(get('slug', community), post.id)

  const toggleChildren = pinned
    ? <span className='pinned'><span className='label'>Pinned</span><span className='icon-More' /></span>
    : <span className='icon-More' />

  return <Dropdown className='post-menu' alignRight {...{toggleChildren}}>
    {canModerate(currentUser, community) && <li>
      <a onClick={pin}>{pinned ? 'Unpin post' : 'Pin post'}</a>
    </li>}
    {canEdit && <li><a className='edit' onClick={edit}>Edit</a></li>}
    {canEdit && <li><a onClick={remove}>Remove</a></li>}
    <li>
      <a onClick={() => actions.followPost(post.id, currentUser)}>
        Turn {following ? 'off' : 'on'} notifications for this post
      </a>
    </li>
    {/* <li>
      <a onClick={() => window.alert('TODO')}>Report objectionable content</a>
    </li> */}
  </Dropdown>
}
Menu.contextTypes = {currentUser: object, community: object}

export const VoteButton = ({ post, actions }, { currentUser }) => {
  let vote = () => actions.voteOnPost(post, currentUser)
  let myVote = includes(map(post.voters, 'id'), (currentUser || {}).id)
  return <a className='vote-button' onClick={vote}>
    {myVote ? <Icon name='Heart2' /> : <Icon name='Heart' />}
    {myVote ? 'Liked' : 'Like'}
  </a>
}
VoteButton.contextTypes = {currentUser: object}

export const Voters = ({ post }, { currentUser }) => {
  const voters = post.voters || []

  let onlyAuthorIsVoting = voters.length === 1 && same('id', first(voters), post.user)
  return voters.length > 0 && !onlyAuthorIsVoting
    ? <LinkedPersonSentence people={voters} className='voters meta'>
        liked this.
      </LinkedPersonSentence>
    : <span />
}
Voters.contextTypes = {currentUser: object}

export const RequestContributorsSentence = ({ post }) => {
  const contributors = post.contributors || []
  const onlyAuthorIsContributing = contributors.length === 1 && same('id', first(contributors), post.user)
  return contributors.length > 0 && !onlyAuthorIsContributing
    ? <LinkedPersonSentence people={contributors} className='contributors' showPopover>
        helped complete this request!
      </LinkedPersonSentence>
    : <div className='contributors'>Request has been completed</div>
}
