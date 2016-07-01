import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { get } from 'lodash'
import { USE_INVITATION, useInvitation, navigate } from '../../actions'
const { func, object, string } = React.PropTypes

@prefetch(({ path, query: { token }, store, dispatch }) =>
  dispatch(useInvitation(token))
  .then(({ error, payload }) =>
    error || dispatch(navigate(`/c/${payload.community.slug}/onboarding`))))
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
