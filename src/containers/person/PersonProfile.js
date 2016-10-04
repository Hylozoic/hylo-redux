import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { prefetch, defer } from 'react-fetcher'
import { commentUrl, peopleUrl } from '../../routes'
import { FETCH_PERSON, fetchPerson, fetchThanks, navigate, showDirectMessage } from '../../actions'
import { saveCurrentCommunityId } from '../../actions/util'
import { capitalize, compact, get, some, includes } from 'lodash'
import { isNull, map, omitBy, sortBy } from 'lodash/fp'
import { VIEWED_PERSON, VIEWED_SELF, trackEvent } from '../../util/analytics'
import { findError } from '../../actions/util'
import PostList from '../../components/PostList'
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

const { func, object } = React.PropTypes

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
const subject = 'person'

const getFetchOpts = query => {
  switch (query.show) {
    case 'request':
      return {tag: 'request', type: null}
    case 'offer':
      return {tag: 'offer', type: null}
    case 'event':
      return {tag: null, type: 'event'}
    default:
      return {tag: null, type: null}
  }
}

const initialFetch = (id, query) => {
  if (query.show === 'thank') {
    return fetchThanks(id)
  } else {
    return fetch(subject, id, getFetchOpts(query))
  }
}

const PersonProfile = compose(
  prefetch(({ store, dispatch, params: { id }, query }) =>
  Promise.all([
    dispatch(fetchPerson(id))
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
    return omitBy(isNull, {
      person,
      community: getCurrentCommunity(state),
      error: findError(state.errors, FETCH_PERSON, 'people', id),
      recentRequest: getPost(get(person, 'recent_request_id'), state),
      recentOffer: getPost(get(person, 'recent_offer_id'), state)
    })
  })
)(props => {
  const { person, currentUser, error, dispatch } = props
  if (error) return <AccessErrorMessage error={error}/>
  if (!person || !person.grouped_post_count) return <div>Loading...</div>

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

  return <CoverImagePage id='person' image={banner_url || defaultBanner}>
    <div className='opener'>
      <NonLinkAvatar person={person}/>
      <h2>
        {person.name}
        <div className='social-media'>
          {facebook_url && <SocialMediaIcon type='facebook' value={facebook_url}/>}
          {twitter_name && <SocialMediaIcon type='twitter' value={twitter_name}/>}
          {linkedin_url && <SocialMediaIcon type='linkedin' value={linkedin_url}/>}
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
      { currentUser &&
        person.id !== currentUser.id &&
        <button
          onClick={() => dispatch(showDirectMessage(person.id, person.name))}
          className='dm-user'>
          <Icon name='Message-Smile'/>
          Message
      </button>}
    </div>
    {some(tags) && <div className='skills'>
      <h3>Skills</h3>
      {tags.map(tag => <A key={tag} to={peopleUrl(community) + `?search=%23${tag}`}>
        #{tag}
      </A>)}
    </div>}
    <div className='section-links'>
      <TabLink category='offer' count={offerCount}/>
      <TabLink category='request' count={requestCount}/>
      <TabLink category='thank' count={person.thank_count}/>
      <TabLink category='event' count={person.event_count}/>
    </div>
    {!category && recentRequest && <div>
      <p className='section-label'>Recent request</p>
      <PostList posts={[recentRequest]} hideMobileSearch/>
    </div>}
    {!category && recentOffer && <div>
      <p className='section-label'>Recent offer</p>
      <PostList posts={[recentOffer]} hideMobileSearch/>
    </div>}
    <ListLabel category={category}/>
    {category === 'thank'
      ? <Thanks person={person}/>
      : <ConnectedPostList {...{subject, id, query: getFetchOpts(query)}}
          hide={postsToHide}
          hideMobileSearch/>}
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
    const toggle = () =>
      dispatch(refetch({show: isActive ? null : category}, location))

    return <a className={isActive ? 'active' : null} onClick={toggle}>
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
    <Icon name={type}/>
  </a>
}

const Thanks = connect((state, { person }) => ({
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
        expand={() => visit(thank.comment)}/>
    </div>)}
  </div>
})
