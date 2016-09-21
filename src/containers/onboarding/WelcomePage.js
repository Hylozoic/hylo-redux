import React from 'react'
import { compose } from 'redux'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchCommunity } from '../../actions/communities'
import A from '../../components/A'
import { communityUrl } from '../../routes'
import { isEmpty } from 'lodash'
import { markdown, sanitize } from 'hylo-utils/text'

const WelcomePage = compose(
  prefetch(({ dispatch, params: { id } }) => dispatch(fetchCommunity(id))),
  connect(({ communities }, { params }) => ({
    community: communities[params.id]
  }))
)(({ community }) => {
  let bg = url => ({style: {backgroundImage: `url(${url})`}})

  if (isEmpty(community)) return <div>Loading...</div>

  return <div id='onboarding-start' className='simple-page'>
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
      <span className='message' dangerouslySetInnerHTML={{__html: markdown(sanitize(community.welcome_message))}}></span>
    </div>

    <A className='button right' to={communityUrl(community)}>
      Continue
    </A>
  </div>
})

export default WelcomePage
