import React, { PropTypes } from 'react'
import { first } from 'lodash'
import { same } from '../models'
import { isCompleteRequest } from '../models/post'
import { completePost } from '../actions/posts'
import LinkedPersonSentence from './LinkedPersonSentence'

export default class RequestCompleteHeader extends React.Component {
  static propTypes = {
    post: PropTypes.object,
    canEdit: PropTypes.bool
  }
  static contextTypes = {
    currentUser: PropTypes.object,
    dispatch: PropTypes.func
  }

  unCompleteRequest = () => {
    const { post } = this.props
    const { dispatch } = this.context
    if (window.confirm('This will mark this request as Incomplete. Are you sure?')) {
      dispatch(completePost(post.id))
    }
  }

  render () {
    const { post, canEdit } = this.props
    const isComplete = isCompleteRequest(post)
    return <div className='request-completed-bar'>
      <div className='request-complete-heading'>
        <div className='request-complete-message'>
          <input className='toggle'
            type='checkbox'
            checked={isComplete}
            disabled={!canEdit}
            onChange={this.unCompleteRequest} />
          <RequestContributorsSentence post={post} />
        </div>
      </div>
    </div>
  }
}

export const RequestContributorsSentence = ({ post }) => {
  const contributors = post.contributors || []
  const onlyAuthorIsContributing = contributors.length === 1 && same('id', first(contributors), post.user)
  return contributors.length > 0 && !onlyAuthorIsContributing
    ? <LinkedPersonSentence people={contributors} className='contributors'>
        helped complete this request!
      </LinkedPersonSentence>
    : <div className='contributors'>Request has been completed</div>
}
