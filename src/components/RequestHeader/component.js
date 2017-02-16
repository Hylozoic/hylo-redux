import React, { PropTypes } from 'react'
import { reject, first } from 'lodash'
import { same } from '../../models'
import { isCompleteRequest } from '../../models/post'
import LinkedPersonSentence from '../LinkedPersonSentence'
import TagInput from '../TagInput'

export default class RequestHeader extends React.Component {
  static propTypes = {
    post: PropTypes.shape({
      id: PropTypes.string.isRequired,
      tag: PropTypes.oneOf(['request']).isRequired
    }),
    canEdit: PropTypes.bool,
    completePost: PropTypes.func.isRequired,
    typeahead: PropTypes.func.isRequired,
    contributorChoices: PropTypes.array,
    confirmFun: PropTypes.func.isRequired
  }

  static defaultProps = {
    confirmFun: (msg) => window.confirm(msg)
  }

  constructor (props, context) {
    super(props, context)
    this.state = {
      requestCompleting: false,
      chosenContributors: []
    }
  }

  toggleRequestCompleting = () => {
    return this.setState({requestCompleting: !this.state.requestCompleting})
  }

  completeRequest = () => {
    const { chosenContributors } = this.state
    const { post, completePost } = this.props
    if (chosenContributors.length > 0) this.setState({chosenContributors: []})
    this.toggleRequestCompleting()
    completePost(post.id, chosenContributors)
  }

  unCompleteRequest = () => {
    const { post, completePost, confirmFun } = this.props
    if (confirmFun('This will mark this request as Incomplete. Are you sure?')) {
      completePost(post.id)
    }
  }

  addContributor = (person) => {
    const { chosenContributors } = this.state
    this.setState({chosenContributors: [...chosenContributors, person]})
  }

  removeContributor = (person) => {
    const { chosenContributors } = this.state
    this.setState({chosenContributors: reject(chosenContributors, {id: person.id})})
  }

  handleContributorInput = (term) => {
    const { post, typeahead } = this.props
    typeahead(term, 'contributors', {
      type: 'people', communityIds: post.community_ids }
    )
  }

  render () {
    const { post, contributorChoices, canEdit } = this.props
    const { requestCompleting, chosenContributors } = this.state

    const isComplete = isCompleteRequest(post)

    if (!isComplete && !canEdit) return null

    const contributors = post.contributors || []
    const onlyAuthorIsContributing = contributors.length === 1 && same('id', first(contributors), post.user)
    const hasContributors = contributors.length > 0 && !onlyAuthorIsContributing

    const completeHeader = () =>
      <div className='request-complete-message'>
        <input type='checkbox'
          className='toggle'
          checked={isComplete}
          onChange={this.unCompleteRequest}
          disabled={!canEdit} />
        {hasContributors
          ? <LinkedPersonSentence people={contributors} showPopover className='contributors'>
              helped complete this request!
            </LinkedPersonSentence>
          : <div className='contributors'>Request has been completed</div>}
      </div>

    const incompleteHeader = () =>
      <div className='request-complete-message'>
        <input type='checkbox'
          className='toggle'
          checked={requestCompleting}
          onChange={this.toggleRequestCompleting} />
        <p>
          {canEdit && requestCompleting
            ? 'Awesome! Who helped you?'
            : 'Click the checkmark if this request has been completed!'}
        </p>
      </div>

    const completionForm = () =>
      <div className='buttons'>
        <a className='cancel' onClick={this.toggleRequestCompleting}>
          <span className='icon icon-Fail' />
        </a>
        <TagInput className='request-complete-people-input'
          choices={contributorChoices}
          handleInput={this.handleContributorInput}
          onSelect={this.addContributor}
          onRemove={this.removeContributor}
          tags={chosenContributors} />
        <a className='done' onClick={this.completeRequest}>Done</a>
      </div>

    return <div className='request-completed-bar'>
      <div className='request-complete-heading'>
        {isComplete ? completeHeader() : incompleteHeader()}
      </div>
      {canEdit && requestCompleting && completionForm()}
    </div>
  }
}
