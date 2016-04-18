import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { fetch, ConnectedPostList } from '../../containers/ConnectedPostList'
import cx from 'classnames'
import { isMember } from '../../models/currentUser'
const { func, object } = React.PropTypes
import { setDefaults, toggleShowPast } from '../Events'

const subject = 'community'

const CommunityEvents = props => {
  let { params: { id }, location, dispatch, currentUser, community } = props
  let query = setDefaults(location.query)
  let showingPast = query.filter !== 'future'

  return <div>
    <div className='list-controls'>
      <button className={cx({active: showingPast})}
        onClick={() => toggleShowPast(!showingPast, dispatch, location)}>
        Show past events
      </button>
    </div>
    <ConnectedPostList {...{subject, id, query}}/>
    {!isMember(currentUser, community) && <div className='meta'>
      You are not a member of this community, so you are shown only posts that are marked as public.
    </div>}
  </div>
}

CommunityEvents.propTypes = {
  dispatch: func,
  params: object,
  community: object,
  currentUser: object
}

export default compose(
  prefetch(({ dispatch, params, query }) => dispatch(fetch(subject, params.id, setDefaults(query)))),
  connect(({ people, communities }, { params }) => ({
    community: communities[params.id],
    currentUser: people.current
  }))
)(CommunityEvents)
