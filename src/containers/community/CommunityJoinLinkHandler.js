import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { get } from 'lodash'
import { communityOnboardingUrl, tagUrl, communityUrl } from '../../routes'
import {
  JOIN_COMMUNITY_WITH_CODE,
  joinCommunityWithCode,
  navigate
} from '../../actions'
const { func, object, string } = React.PropTypes

const redirectAfterJoin = (membership, tagName, dispatch) => {
  const { community, preexisting } = membership
  if (preexisting && tagName) {
    dispatch(navigate(tagUrl(tagName, community.slug)))
  } else if (preexisting) {
    dispatch(navigate(communityUrl(community)))
  } else {
    dispatch(navigate(communityOnboardingUrl(community)))
  }
}

@prefetch(({ path, params: { code, tagName }, dispatch }) =>
  dispatch(joinCommunityWithCode(code, tagName))
  .then(({ error, payload }) =>
    error || redirectAfterJoin(payload, tagName, dispatch)))
@connect(({ errors, people }, { tagName }) => ({
  codeError: get(errors[JOIN_COMMUNITY_WITH_CODE], 'payload.response.body'),
  currentUser: people.current
}), null, null, {withRef: true})
export default class CommunityJoinLinkHandler extends React.Component {
  static propTypes = {
    currentUser: object,
    dispatch: func,
    params: object,
    codeError: string
  }

  render () {
    const { codeError } = this.props
    return <div>
      {codeError
        ? <div className='alert alert-danger'>{codeError}</div>
        : <div>Loading...</div>}
    </div>
  }
}
