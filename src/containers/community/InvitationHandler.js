import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { get } from 'lodash'
import {
  USE_INVITATION,
  useInvitation,
  navigate,
  fetchLeftNavTags,
  fetchCommunity,
  setCurrentCommunityId
} from '../../actions'
const { func, object, string } = React.PropTypes

@prefetch(({ path, query: { token }, dispatch }) =>
  dispatch(useInvitation(token)))
@connect(({ errors, people, communities }, { location: { query: { token } } }) => ({
  tokenError: get(errors[USE_INVITATION], 'payload.response.body'),
  currentUser: people.current,
  community: communities[token]
}))
export default class InvitationHandler extends React.Component {
  static propTypes = {
    currentUser: object,
    dispatch: func,
    params: object,
    tokenError: string,
    community: object
  }

  // FIXME this kind of smells. at first, I tried doing a navigate in the
  // prefetch after the join action finishes, and this works on the client, but
  // not in server-side rendering. would have to jump back into appHandler to
  // implement checking for redirects that take place during prefetching
  componentDidMount () {
    let { dispatch, community: { slug, id } } = this.props
    if (slug) {
      dispatch(fetchLeftNavTags(slug))
      .then(() => dispatch(fetchCommunity(slug)))
      .then(() => dispatch(setCurrentCommunityId(id)))
      .then(() => dispatch(navigate(`/c/${slug}`)))
    }
  }

  render () {
    let { tokenError } = this.props
    let errorMessage
    switch (tokenError) {
      case 'bad token':
        errorMessage = 'This invitation link is not valid.'
        break
      case 'used token':
        errorMessage = 'This invitation link has already been used.'
        break
      case 'already a member':
        errorMessage = `You are already a member of the community.`
        break
    }

    return <div>
      {tokenError
        ? <div className='alert alert-danger'>{errorMessage}</div>
        : <div>Loading...</div>}
    </div>
  }
}
