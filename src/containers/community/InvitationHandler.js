import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { get } from 'lodash'
import { USE_INVITATION, useInvitation } from '../../actions'
import { navigateAfterJoin } from './CommunityJoinLinkHandler'
const { func, object, string } = React.PropTypes

@prefetch(({ path, query: { token }, store, dispatch }) =>
  dispatch(useInvitation(token))
  .then(({ error, payload: { community } }) =>
    error || dispatch(navigateAfterJoin(community))))
@connect(({ errors, people, communities }, { location: { query: { token } } }) => ({
  tokenError: get(errors[USE_INVITATION], 'payload.response.body')
}))
export default class InvitationHandler extends React.Component {
  static propTypes = {
    dispatch: func,
    params: object,
    tokenError: string
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
    }

    return <div>
      {tokenError
        ? <div className='alert alert-danger'>{errorMessage}</div>
        : <div>Loading...</div>}
    </div>
  }
}
