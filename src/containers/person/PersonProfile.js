import React from 'react'
import { connect } from 'react-redux'
import { prefetch, defer } from 'react-fetcher'
import { FETCH_PERSON, fetchPerson } from '../../actions'
import { get } from 'lodash'
import { VIEWED_PERSON, VIEWED_SELF, trackEvent } from '../../util/analytics'
import { A, IndexA } from '../../components/A'
import { findError } from '../../actions/util'
import AccessErrorMessage from '../../components/AccessErrorMessage'
const { object } = React.PropTypes

const defaultBanner = 'https://d3ngex8q79bk55.cloudfront.net/misc/default_user_banner.jpg'

@prefetch(({ dispatch, params: { id } }) => dispatch(fetchPerson(id)))
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
@connect(({ people, errors }, { params: { id } }) => ({
  person: people[id],
  currentUser: people.current,
  error: findError(errors, FETCH_PERSON, 'people', id)
}))
export default class PersonProfile extends React.Component {
  static propTypes = {
    params: object,
    person: object,
    children: object,
    currentUser: object,
    error: object
  }

  render () {
    let { person, currentUser, error } = this.props
    if (error) return <AccessErrorMessage error={error}/>
    if (!person) return <div>Loading...</div>

    let bannerUrl = person.banner_url || defaultBanner
    let isSelf = currentUser && person.id === currentUser.id

    return <div id='person'>
      <div className='banner'>
        <div className='background' style={{backgroundImage: `url(${bannerUrl})`}}/>
        <div className='corner'>
          {isSelf && <A to={`/settings?expand=profile`}>Edit profile</A>}
        </div>
        <div className='logo person' style={{backgroundImage: `url(${person.avatar_url})`}}/>
        <h2>{person.name}</h2>
        <ul className='tabs'>
          <li><IndexA to={`/u/${person.id}`}>Posts</IndexA></li>
          <li><A to={`/u/${person.id}/about`}>About</A></li>
          <li><A to={`/u/${person.id}/contributions`}>Contributions</A></li>
          <li><A to={`/u/${person.id}/thanks`}>Thanks</A></li>
        </ul>
      </div>
      {this.props.children}
    </div>
  }
}
