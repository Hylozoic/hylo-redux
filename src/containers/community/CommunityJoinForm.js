import React from 'react'
import { connect } from 'react-redux'
const { func, bool, string } = React.PropTypes
import { get, isEmpty } from 'lodash'
import {
  JOIN_COMMUNITY_WITH_CODE,
  resetError,
  joinCommunityWithCode,
  navigate,
  resetCommunityValidation,
  validateCommunityAttribute }
from '../../actions'
import cx from 'classnames'

@connect(({communityValidation, errors}) => {
  var error
  if (errors[JOIN_COMMUNITY_WITH_CODE]) {
    error = "We didn't recognize that code; please check that you entered it correctly and try again."
  }
  let codeInvalid = !get(communityValidation, 'beta_access_code.exists')
  return {error, codeInvalid}
})
export default class CommunityJoinForm extends React.Component {
  static propTypes = {
    dispatch: func,
    codeInvalid: bool,
    error: string
  }

  codeChanged = event => {
    let { dispatch, error } = this.props
    let { value } = event.target
    if (error) {
      dispatch(resetError(JOIN_COMMUNITY_WITH_CODE))
    }
    if (isEmpty(value.trim())) {
      dispatch(resetCommunityValidation('beta_access_code'))
    } else {
      dispatch(validateCommunityAttribute('beta_access_code', value, 'exists'))
    }
  }

  submit = () => {
    let { dispatch, codeInvalid } = this.props

    if (codeInvalid) return

    let code = this.refs.code.value
    dispatch(joinCommunityWithCode(code))
    .then(({ error, payload }) => error || dispatch(navigate(`/c/${payload.community.slug}`)))
  }

  render () {
    let { codeInvalid, error } = this.props

    return <div id='community-editor' className='form-sections'>
      <h2>Join a community</h2>
      <p>Enter the code that was given to you by your community manager.</p>
      {error && <div className='alert alert-danger'>{error}</div>}
      <input type='text' ref='code' className='form-control' onChange={this.codeChanged}/>
      <button className={cx({'disabled': codeInvalid})} onClick={this.submit}>Join</button>
    </div>
  }
}
