import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { find, get, map } from 'lodash'
import { communityUrl } from '../../routes'
import {
  JOIN_COMMUNITY_WITH_CODE,
  joinCommunityWithCode,
  navigate
} from '../../actions'
const { func, object, string } = React.PropTypes

@prefetch(({ path, params: { id, code }, dispatch }) => {
  return dispatch(joinCommunityWithCode(code))
})
@connect(({ errors, people }) => ({
  codeError: get(errors[JOIN_COMMUNITY_WITH_CODE], 'payload.response.body'),
  currentUser: people.current
}))
export default class CommunityJoinLinkHandler extends React.Component {
  static propTypes = {
    currentUser: object,
    dispatch: func,
    params: object,
    codeError: string
  }

  // FIXME this kind of smells. at first, I tried doing a navigate in the
  // prefetch after the join action finishes, and this works on the client, but
  // not in server-side rendering. would have to jump back into appHandler to
  // implement checking for redirects that take place during prefetching
  componentDidMount () {
    let { currentUser, dispatch, params: { id } } = this.props
    if (currentUser) {
      let community = find(map(currentUser.memberships, 'community'), c => c.slug === id)
      if (community) {
        let url = communityUrl(community, {onboarding: true})
        // for some reason, calling navigate here without wrapping it in
        // setTimeout results in prefetching not taking place in the
        // CommunityProfile that we go to next
        setTimeout(() => dispatch(navigate(url)))
      }
    }
  }

  render () {
    let { codeError } = this.props
    return <div>
      {codeError
        ? <div className='alert alert-danger'>{codeError}</div>
        : <div>Loading...</div>}
    </div>
  }
}
