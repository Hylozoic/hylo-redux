import React from 'react'
import { compose } from 'redux'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchOnboarding } from '../actions'
import A from '../components/A'
import { communityUrl } from '../routes'
import { isEmpty } from 'lodash'

const Onboarding = compose(
  prefetch(({ dispatch, params: { id }, currentUser }) =>
    dispatch(fetchOnboarding(currentUser.id, id))),
  connect(({ onboarding }) => ({community: onboarding}))
)(({ community }) => {
  let bg = url => ({style: {backgroundImage: `url(${url})`}})

  if (isEmpty(community)) return <div>Loading...</div>

  return <div id='onboarding-start'>
    <div className='header'>
      <h2>Welcome to {community.name}</h2>
      <div className='logo' {...bg(community.avatar_url)}></div>
      <span className='operator'>&times;</span>
      <div className='logo hylo-logo'></div>
    </div>
    <h4>Discover the people, skills, and resources all around you with Hylo. Together, we can create anything we can imagine.</h4>
    <div className='leader-message'>
      <span className='leader'>
        <span className='medium-avatar' {...bg(community.leader.avatar_url)}></span>
        {community.leader.name}
      </span>
      <span className='message'>{community.welcome_message}</span>
    </div>

    <A className='btn right btn-primary'
      to={communityUrl(community, {onboarding: true})}>
      Continue
    </A>
  </div>
})

export default Onboarding
