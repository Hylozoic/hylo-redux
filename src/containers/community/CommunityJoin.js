import React from 'react'
import { connect } from 'react-redux'
const { func, bool } = React.PropTypes
import { get, isEmpty } from 'lodash'
import { joinCommunityWithCode, navigate, resetCommunityValidation, validateCommunityAttribute } from '../../actions'
import cx from 'classnames'

@connect(({communityValidation}) => ({
  codeInvalid: !get(communityValidation, 'beta_access_code.exists')
}))
export default class CommunityJoin extends React.Component {
  static propTypes = {
    dispatch: func,
    codeInvalid: bool
  }

  codeChanged = event => {
    let { dispatch } = this.props
    let { value } = event.target
    if (isEmpty(value.trim())) {
      dispatch(resetCommunityValidation('beta_access_code'))
    } else {
      dispatch(validateCommunityAttribute('beta_access_code', value, 'exists'))
    }
  }

  submit = () => {
    let { dispatch, codeInvalid } = this.props

    if (codeInvalid) {
      return
    }
    let code = this.refs.code.value
    dispatch(joinCommunityWithCode(code))
    .then(action => {
      if (action.error) {
        console.log('TODO - display error message')
        return
      }
      dispatch(navigate(`/c/${action.payload.community.slug}`))
    })
  }

  render () {
    let { codeInvalid } = this.props

    return <div id='community-editor' className='form-sections'>
      <h2>Join a community</h2>
      <p>Enter the code that was given to you by your community manager.</p>
      <input type='text' ref='code' className='form-control' onChange={this.codeChanged}/>
      <button className={cx({'disabled': codeInvalid})} onClick={this.submit}>Join</button>
    </div>
  }
}
