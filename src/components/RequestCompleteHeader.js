import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { first } from 'lodash'
import { same } from '../models'
import { isCompleteRequest } from '../models/post'
import { completePost } from '../actions/posts'
import LinkedPersonSentence from './LinkedPersonSentence'

export class RequestCompleteHeader extends React.Component {
  static propTypes = {
    post: PropTypes.object.isRequired,
    completePost: PropTypes.func.isRequired,
    confirmFun: PropTypes.func.isRequired,
    canEdit: PropTypes.bool
  }

  static defaultProps ={
    confirmFun: (msg) => window.confirm(msg)
  }

  unCompleteRequest = () => {
    const { post, completePost, confirmFun } = this.props
    if (confirmFun('This will mark this request as Incomplete. Are you sure?')) {
      completePost(post.id)
    }
  }

  render () {
    const { post, canEdit } = this.props
    const isComplete = isCompleteRequest(post)
    const contributors = post.contributors || []
    const onlyAuthorIsContributing = contributors.length === 1 && same('id', first(contributors), post.user)
    const contributorsSentence = contributors.length > 0 && !onlyAuthorIsContributing
      ? <LinkedPersonSentence people={contributors} showPopover className='contributors'>
          helped complete this request!
        </LinkedPersonSentence>
      : <div className='contributors'>Request has been completed</div>
    return <div className='request-completed-bar'>
      <div className='request-complete-heading'>
        <div className='request-complete-message'>
          <input className='toggle'
            type='checkbox'
            checked={isComplete}
            disabled={!canEdit}
            onChange={this.unCompleteRequest} />
          {contributorsSentence}
        </div>
      </div>
    </div>
  }
}

export default connect(null, { completePost })(RequestCompleteHeader)
