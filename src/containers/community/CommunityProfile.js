import React from 'react'
import { A, IndexA } from '../../components/A'
import { connect } from 'react-redux'
import { prefetch, defer } from 'react-fetcher'
import { find, get } from 'lodash'
import { fetchCommunity, navigate, updateUserSettings } from '../../actions'
import { locationWithoutParams } from '../../client/util'
import { VIEWED_COMMUNITY, trackEvent } from '../../util/analytics'
import { VelocityTransitionGroup } from 'velocity-react'
import ListItemTagInput from '../../components/ListItemTagInput'
const { func, object } = React.PropTypes

@prefetch(({ dispatch, params: { id } }) => dispatch(fetchCommunity(id)))
@defer(({ params: { id }, store }) => {
  let community = store.getState().communities[id]
  return trackEvent(VIEWED_COMMUNITY, {community})
})
@connect((state, props) => ({
  community: state.communities[props.params.id],
  currentUser: state.people.current
}))
export default class CommunityProfile extends React.Component {
  static propTypes = {
    community: object,
    currentUser: object,
    children: object,
    location: object,
    dispatch: func
  }

  render () {
    let { community, currentUser, location, dispatch } = this.props

    // we might have partial data for a community already; if this component
    // renders without banner_url, it'll cause a request to an invalid url
    if (!community || !community.banner_url) return <div>Loading...</div>

    let { slug, banner_url, avatar_url, name } = community

    let canModerate = !!find(currentUser.memberships, m => m.community.id === community.id && m.role === 1)

    return <div id='community' className='tabbed-context'>
      <VelocityTransitionGroup enter={{animation: 'slideDown', duration: 800}}
        leave={{animation: 'slideUp', duration: 800}}
        runOnMount={true}>
          {get(location, 'query.onboarding') &&
            <OnboardingQuestions person={currentUser} dispatch={dispatch}/>}
      </VelocityTransitionGroup>
      <div className='banner'>
        <div className='background' style={{backgroundImage: `url(${banner_url})`}}/>
        <div className='corner'>
          {canModerate && <A to={`/c/${slug}/settings`}>Settings</A>}
        </div>
        <div className='logo' style={{backgroundImage: `url(${avatar_url})`}}/>
        <h2>{name}</h2>
        <ul className='tabs'>
          <li><IndexA to={`/c/${slug}`}>Posts</IndexA></li>
          <li><A to={`/c/${slug}/events`}>Events</A></li>
          <li><A to={`/c/${slug}/projects`}>Projects</A></li>
          <li><A to={`/c/${slug}/members`}>Members</A></li>
          <li><A to={`/c/${slug}/about`}>About</A></li>
        </ul>
      </div>
      {this.props.children}
    </div>
  }
}

const OnboardingQuestions = ({ person, dispatch }) => {
  let update = (field, value) =>
    dispatch(updateUserSettings({...person, [field]: value}, {[field]: person[field]}))

  let close = () => dispatch(navigate(locationWithoutParams('onboarding')))

  return <div className='onboarding'>
    <div className='header'>
      <h3>Let's get started</h3>
    </div>
    <div className='content'>
      <p>Tell us a little about yourself!</p>
      <p>What <strong>groups or organizations</strong> are you part of?</p>
      <ListItemTagInput person={person} type='organizations' update={update}/>
      <br/>
      <p>Are there any <strong>skills, passions, or hobbies</strong> you'd like to be known for in your community?</p>
      <ListItemTagInput person={person} type='skills' update={update}/>
      <p className='meta'>Type names, pressing Enter after each one. This information will be searchable and shown on your profile, helping other members discover opportunities to collaborate with you. You can change it later.</p>
      <div className='align-right'>
        <button onClick={close} className='btn-primary'>Done</button>
      </div>
    </div>
  </div>
}
