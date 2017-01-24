/* eslint-disable camelcase */
import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { prefetch, defer } from 'react-fetcher'
import { commentUrl, peopleUrl } from '../../routes'
import { FETCH_PERSON, navigate, showDirectMessage } from '../../actions'
import { fetchContributions, fetchPerson, fetchThanks } from '../../actions/people'
import { findError, saveCurrentCommunityId } from '../../actions/util'
import { capitalize, compact, get, some, includes } from 'lodash'
import { isNull, isUndefined, map, omitBy, sortBy } from 'lodash/fp'
import { STARTED_MESSAGE, VIEWED_PERSON, VIEWED_SELF, trackEvent } from '../../util/analytics'
import PostList from '../../components/PostList'
import Post from '../../components/Post'
import A from '../../components/A'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import { refetch } from '../../util/caching'
import AccessErrorMessage from '../../components/AccessErrorMessage'
import CoverImagePage from '../../components/CoverImagePage'
import Icon from '../../components/Icon'
import Comment from '../../components/Comment'
import { normalizeUrl } from '../../util/text'
import { NonLinkAvatar } from '../../components/Avatar'
import moment from 'moment'
import { getPost } from '../../models/post'
import { getCurrentCommunity } from '../../models/community'
import { defaultBanner } from '../../models/person'
import { DIRECT_MESSAGES, CONTRIBUTORS } from '../../config/featureFlags'
import { hasFeature } from '../../models/currentUser'

const { func, object } = React.PropTypes

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
const subject = 'person'

const getFetchOpts = (query, fetchingPosts = true) => {
  const defaults = {tag: null, type: null}
  if (query['check-join-requests']) {
    defaults['check-join-requests'] = 1
  }

  if (!fetchingPosts) return defaults

  switch (query.show) {
    case 'request':
      return {...defaults, tag: 'request'}
    case 'offer':
      return {...defaults, tag: 'offer'}
    case 'event':
      return {...defaults, type: 'event'}
    default:
      return defaults
  }
}

const initialFetch = (id, query) => {
  switch (query.show) {
    case 'thank':
      return fetchThanks(id, getFetchOpts(query, false))
    case 'contribution':
      return fetchContributions(id, getFetchOpts(query, false))
    default:
      return fetch(subject, id, getFetchOpts(query))
  }
}

const PersonProfile = compose(
  prefetch(({ store, dispatch, params: { id }, query }) =>
  Promise.all([
    dispatch(fetchPerson(id, query))
    .then(({ payload: { shared_communities }, error }) => {
      if (error || !shared_communities) return
      let { currentCommunityId } = store.getState()
      if (includes(shared_communities, currentCommunityId)) return
      return saveCurrentCommunityId(dispatch, shared_communities[0] || 'all', true)
    }),
    dispatch(initialFetch(id, query))
  ])),
  defer(({ store, params: { id }, currentUser }) => {
    let state = store.getState()
    let person = state.people[id]
    if (!person) return
    if (get(currentUser, 'id') === person.id) {
      return trackEvent(VIEWED_SELF)
    } else {
      return trackEvent(VIEWED_PERSON, {person})
    }
  }),
  connect((state, { params: { id } }) => {
    const person = state.people[id]
    return omitBy(x => isNull(x) || isUndefined(x), {
      person,
      currentUser: state.people.current,
      community: getCurrentCommunity(state),
      error: findError(state.errors, FETCH_PERSON, 'people', id),
      recentRequest: getPost(get(person, 'recent_request_id'), state),
      recentOffer: getPost(get(person, 'recent_offer_id'), state)
    })
  })
)(props => {
  const { person, currentUser, error, dispatch } = props
  if (error) return <AccessErrorMessage error={error} />
  if (!person || !person.grouped_post_count) return <div>Loading...</div>

  const isSelf = person.id === currentUser.id

  const {
    params: { id }, location: { query }, recentRequest, recentOffer, community
  } = props
  const category = query.show
  const {
    banner_url, bio, tags, location, created_at,
    facebook_url, linkedin_url, twitter_name
  } = person
  const url = normalizeUrl(person.url)

  const joinDate = moment(created_at).format('MMMM YYYY')
  const requestCount = person.grouped_post_count.request || 0
  const offerCount = person.grouped_post_count.offer || 0
  const TabLink = setupTabLink(props)
  const postsToHide = category ? [] : map('id', compact([recentRequest, recentOffer]))
  const startMessage = () => {
    trackEvent(STARTED_MESSAGE, {context: 'profile'})
    return dispatch(showDirectMessage(person.id, person.name))
  }
  const ActivityItemsForCategory = ({category, person}) => {
    switch (category) {
      case 'thank':
        return <Thanks person={person} />
      case 'contribution':
        if (hasFeature(currentUser, CONTRIBUTORS)) {
          return <Contributions person={person} />
        }
        break
      default:
        return <ConnectedPostList {...{subject, id, query: getFetchOpts(query)}}
          hide={postsToHide} hideMobileSearch />
    }
  }

  return <CoverImagePage id='person' image={banner_url || defaultBanner} showEdit={isSelf}>
    <div className='opener'>
      <NonLinkAvatar person={person} showEdit={isSelf} />
      <h2>
        {person.name}
        <div className='social-media'>
          {facebook_url && <SocialMediaIcon type='facebook' value={facebook_url} />}
          {twitter_name && <SocialMediaIcon type='twitter' value={twitter_name} />}
          {linkedin_url && <SocialMediaIcon type='linkedin' value={linkedin_url} />}
        </div>
      </h2>
      <p className='meta'>
        {location && <span>{location}{spacer}</span>}
        {url && <span>
          <a href={url.format()} target='_blank'>{url.hostname}</a>
          {spacer}
        </span>}
        Joined {joinDate}
      </p>
      <p className='bio'>{bio}</p>
      {currentUser && !isSelf &&
        hasFeature(currentUser, DIRECT_MESSAGES) &&
        <button onClick={startMessage} className='dm-user'>
          <Icon name='Message-Smile' /> Message
      </button>}
    </div>
    {some(tags) && <div className='skills'>
      <h3>Skills</h3>
      {tags.map(tag => <A key={tag} to={peopleUrl(community) + `?search=%23${tag}`}>
        #{tag}
      </A>)}
    </div>}
    <div className={`section-links ${hasFeature(currentUser, CONTRIBUTORS) ? 'contributions-feature' : ''}`}>
      <TabLink category='offer' count={offerCount} />
      <TabLink category='request' count={requestCount} />
      <TabLink category='thank' count={person.thank_count} />
      <TabLink category='event' count={person.event_count} />
      {hasFeature(currentUser, CONTRIBUTORS) &&
        <TabLink category='contribution' count={person.contribution_count} />
      }
    </div>
    {!category && recentRequest && <div>
      <p className='section-label'>Recent request</p>
      <PostList posts={[recentRequest]} hideMobileSearch />
    </div>}
    {!category && recentOffer && <div>
      <p className='section-label'>Recent offer</p>
      <PostList posts={[recentOffer]} hideMobileSearch />
    </div>}
    <ListLabel category={category} />
    <ActivityItemsForCategory category={category} person={person} />
  </CoverImagePage>
})

PersonProfile.propTypes = {
  params: object,
  person: object,
  children: object,
  error: object,
  location: object,
  dispatch: func,
  recentRequest: object,
  recentOffer: object
}

export default PersonProfile

const setupTabLink = (props) => {
  const { location, dispatch } = props
  const { query } = location

  const TabLink = ({ category, count }) => {
    const isActive = category === query.show
    let cssClasses = [category]
    if (isActive) { cssClasses.push('active') }
    const toggle = () =>
      dispatch(refetch({show: isActive ? null : category}, location))
    return <a className={cssClasses} onClick={toggle}>
      {count} {capitalize(category)}{Number(count) === 1 ? '' : 's'}
    </a>
  }

  return TabLink
}

const ListLabel = ({ category }) => {
  let label
  switch (category) {
    case 'offer': label = 'Offers'; break
    case 'request': label = 'Requests'; break
    case 'thank': label = 'Thanks'; break
    case 'contribution': label = 'Contributions'; break
    case 'event': label = 'Events'; break
    default: label = 'Recent posts'
  }
  return <p className='section-label'>{label}</p>
}

const SocialMediaIcon = ({ type, value }) => {
  let href
  switch (type) {
    case 'facebook':
    case 'linkedin':
      href = value
      break
    case 'twitter':
      href = `http://twitter.com/${value}`
  }

  return <a target='_blank' className={type} href={href}>
    <Icon name={type} />
  </a>
}

const Thanks = connect((state, {person}) => ({
  thanks: sortBy(t => -t.created_at, state.thanks[person.id])
}))(({ thanks, person, dispatch }) => {
  const visit = comment => dispatch(navigate(commentUrl(comment)))
  return <div className='thanks'>
    {thanks.map(thank => <div key={thank.id}>
      <span>
        <A to={`/u/${thank.thankedBy.id}`}>{thank.thankedBy.name}</A>
        &nbsp;thanked {person.name.split(' ')[0]} for:
      </span>
      <Comment comment={{...thank.comment, user: person}} truncate
        expand={() => visit(thank.comment)} />
    </div>)}
  </div>
})

const Contributions = connect((state, {person}) => ({
  contributions: sortBy(contribution => -contribution.created_at, state.contributions[person.id])
}))(({ contributions, person, dispatch }) => {
  return <div className='contributions'>
    {contributions.map(contribution => <div key={contribution.id}>
      <span>
        <A to={`/u/${person.id}`}>{person.name.split(' ')[0]}</A>
        &nbsp;helped {contribution.post.user.name} complete their request.
        <Post post={contribution.post} onExpand={() => dispatch(navigate(`/p/${contribution.post.id}`))} />
      </span>
    </div>)}
  </div>
})
