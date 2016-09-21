import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { get } from 'lodash'
import { JOIN_COMMUNITY_WITH_CODE } from '../../actions'
import { joinCommunityWithCode } from '../../actions/communities'
import { navigateAfterJoin } from '../../util/navigation'
const { func, object, string } = React.PropTypes

@prefetch(({ path, params: { code, tagName }, dispatch }) =>
  dispatch(joinCommunityWithCode(code, tagName))
  .then(({ error, payload: { community, preexisting } }) =>
    error || dispatch(navigateAfterJoin(community, tagName, preexisting))))
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
