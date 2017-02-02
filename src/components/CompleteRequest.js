import React, { PropTypes } from 'react'
import { reject } from 'lodash'
import { connect } from 'react-redux'
import { isCompleteRequest } from '../models/post'
import { typeahead } from '../actions'
import { completePost } from '../actions/posts'

import TagInput from './TagInput'

export class CompleteRequest extends React.Component {
  static propTypes = {
    post: PropTypes.object,
    canEdit: PropTypes.bool,
    contributorChoices: PropTypes.array
  }

  static contextTypes = {
    currentUser: PropTypes.object,
    dispatch: PropTypes.func
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      requestCompleting: false,
      contributors: []
    }
  }

  toggleRequestCompleting = () => {
    return this.setState({requestCompleting: !this.state.requestCompleting})
  }

  completeRequest = () => {
    const { contributors } = this.state
    const { post } = this.props
    const { dispatch } = this.context
    if (contributors.length > 0) this.setState({contributors: []})
    this.toggleRequestCompleting()
    dispatch(completePost(post.id, contributors))
  }

  addContributor = (person) => {
    const { contributors } = this.state
    this.setState({contributors: [...contributors, person]})
  }

  removeContributor = (person) => {
    const { contributors } = this.state
    this.setState({contributors: reject(contributors, {id: person.id})})
  }

  handleContributorInput = (term) => {
    const { post } = this.props
    this.context.dispatch(typeahead(term, 'contributors', {
      type: 'people', communityIds: post.community_ids }
    ))
  }

  render () {
    const { contributorChoices, post, canEdit } = this.props
    const { requestCompleting, contributors } = this.state
    const completableRequest = !isCompleteRequest(post) && canEdit
    return completableRequest &&
      <div className='request-completed-bar'>
        <div className='request-complete-heading'>
          <div className='request-complete-message'>
            <input type='checkbox'
              className='toggle'
              checked={requestCompleting}
              onChange={this.toggleRequestCompleting} />
            <p>
              {requestCompleting
                ? 'Awesome! Who helped you?'
                : 'Click the checkmark if this request has been completed!'}
            </p>
          </div>
        </div>
        {requestCompleting &&
          <div className='buttons'>
            <a className='cancel' onClick={this.toggleRequestCompleting}>
              <span className='icon icon-Fail' />
            </a>
            <TagInput className='request-complete-people-input'
              choices={contributorChoices}
              handleInput={this.handleContributorInput}
              onSelect={this.addContributor}
              onRemove={this.removeContributor}
              tags={contributors} />
            <a className='done' onClick={this.completeRequest}>Done</a>
          </div>
        }
      </div>
  }
}

export default connect((state, {post}) => {
  return {
    contributorChoices: reject(
      state.typeaheadMatches.contributors, {id: post.user_id}
    )
  }
})(CompleteRequest)