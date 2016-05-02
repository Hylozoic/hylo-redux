import React from 'react'
import { connect } from 'react-redux'
import { prefetch, defer } from 'react-fetcher'
import { FETCH_PERSON, fetchPerson } from '../../actions'
import { capitalize, compact, get, some } from 'lodash'
import { map } from 'lodash/fp'
import { VIEWED_PERSON, VIEWED_SELF, trackEvent } from '../../util/analytics'
import { findError } from '../../actions/util'
import PostList from '../../components/PostList'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import { refetch } from '../../util/caching'
import AccessErrorMessage from '../../components/AccessErrorMessage'
import CoverImagePage from '../../components/CoverImagePage'
import { parse } from 'url'
import moment from 'moment'
import { getPost } from '../../models/post'
const { func, object } = React.PropTypes

const defaultBanner = 'https://d3ngex8q79bk55.cloudfront.net/misc/default_user_banner.jpg'
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
    case 'thank':
      // TODO
      // return {tag: null, type: 'event'}
    default:
      return {tag: null, type: null}
  }
}

@prefetch(({ dispatch, params: { id }, query }) =>
  Promise.all([
    dispatch(fetchPerson(id)),
    dispatch(fetch(subject, id, getFetchOpts(query)))
  ]))
@defer(({ store, params: { id } }) => {
  let state = store.getState()
  let person = state.people[id]
  if (!person) return
  let currentUser = state.people.current
  if (get(currentUser, 'id') === person.id) {
    return trackEvent(VIEWED_SELF)
  } else {
    return trackEvent(VIEWED_PERSON, {person})
  }
})
@connect((state, { params: { id } }) => {
  const person = state.people[id]
  return {
    person,
    currentUser: state.people.current,
    error: findError(state.errors, FETCH_PERSON, 'people', id),
    recentRequest: getPost(get(person, 'recent_request_id'), state),
    recentOffer: getPost(get(person, 'recent_offer_id'), state)
  }
})
export default class PersonProfile extends React.Component {
  static propTypes = {
    params: object,
    person: object,
    children: object,
    currentUser: object,
    error: object,
    location: object,
    dispatch: func,
    recentRequest: object,
    recentOffer: object
  }

  render () {
    const { person, error } = this.props
    if (error) return <AccessErrorMessage error={error}/>
    if (!person || !person.grouped_post_count) return <div>Loading...</div>

    const {
      params: { id }, location: { query }, recentRequest, recentOffer
    } = this.props
    const category = query.show
    const { banner_url, bio, tags, location, url, created_at } = person

    const joinDate = moment(created_at).format('MMMM YYYY')
    const requestCount = person.grouped_post_count.request || 0
    const offerCount = person.grouped_post_count.offer || 0
    const TabLink = setupTabLink(this.props)

    return <CoverImagePage id='person' image={banner_url || defaultBanner}>
      <div className='opener'>
        <div className='avatar'
          style={{backgroundImage: `url(${person.avatar_url})`}}/>
        <h2>{person.name}</h2>
        <p className='meta'>
          {location && <span>{location}{spacer}</span>}
          {url && <span>
            <a href={url} target='_blank'>{parse(url).hostname}</a>
            {spacer}
          </span>}
          Joined {joinDate}
        </p>
        <p className='bio'>{bio}</p>
      </div>
      {some(tags) && <div className='skills'>
        <h3>Skills</h3>
        {tags.map(t => <a className='skill' key={t}>#{t}</a>)}
      </div>}
      <div className='section-links'>
        <TabLink category='offer' count={offerCount}/>
        <TabLink category='request' count={requestCount}/>
        <TabLink category='thank' count={person.thank_count}/>
        <TabLink category='event' count={person.event_count}/>
      </div>
      {!category && recentRequest && <div>
        <p className='section-label'>Recent request</p>
        <PostList posts={[recentRequest]}/>
      </div>}
      {!category && recentOffer && <div>
        <p className='section-label'>Recent offer</p>
        <PostList posts={[recentOffer]}/>
      </div>}
      <ListLabel category={category}/>
      {category !== 'thank' &&
        <ConnectedPostList {...{subject, id, query: getFetchOpts(query)}}
          hide={map('id', compact([recentRequest, recentOffer]))}/>}
    </CoverImagePage>
  }
}

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
