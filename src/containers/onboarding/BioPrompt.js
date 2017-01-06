import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { compose } from 'redux'
import CommunityHeader from '../../components/CommunityHeader'
import Modal from '../../components/Modal'
import ModalOnlyPage from '../../components/ModalOnlyPage'
import { ModalInput } from '../../components/ModalRow'
import { updateCurrentUser } from '../../actions'
import { fetchTags } from '../../actions/tags'
import A from '../../components/A'
import { debounce } from 'lodash'
import { find, filter, isEmpty } from 'lodash/fp'
import { nextOnboardingUrl } from '../../util/navigation'
import { getCommunity } from '../../models/community'
import { connectedListProps } from '../../util/caching'
import { trackEvent, ADDED_BIO } from '../../util/analytics'
const { func, object } = React.PropTypes

const subject = 'community'

const trackBioUpdate = debounce(() => trackEvent(ADDED_BIO, {context: 'onboarding'}), 10000)

const BioPrompt = ({ location, community, skipTopics }, { currentUser, dispatch }) => {
  const update = debounce(bio => {
    trackBioUpdate()
    return dispatch(updateCurrentUser({bio}))
  }, 500)

  return <ModalOnlyPage id='bio-prompt' className='login-signup'>
    <CommunityHeader community={community}/>
    <Modal standalone title='How would you describe yourself in 140 characters?'>
      <ModalInput label='Describe yourself' maxLength={140}
        defaultValue={currentUser.bio || ''}
        onChange={event => update(event.target.value)}/>
      <div className='footer'>
        <A className='button' to={nextOnboardingUrl(location, skipTopics)}>Next</A>
      </div>
    </Modal>
  </ModalOnlyPage>
}
BioPrompt.contextTypes = {currentUser: object, dispatch: func}

export default compose(
  prefetch(({ query, dispatch }) => dispatch(fetchTags({subject, limit: 10, id: query.community, sort: 'popularity'}))),
  connect((state, { location }) => {
    const community = getCommunity(location.query.community, state)
    const { tags } = connectedListProps(state, {subject, id: community.slug}, 'tags')
    const isNotDefault = tag =>
      !find(m => m.community_id === community.id, tag.memberships).is_default
    const skipTopics = isEmpty(filter(isNotDefault, tags))

    return { community, skipTopics }
  }))(BioPrompt)
