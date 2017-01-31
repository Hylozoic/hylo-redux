import React from 'react'
import { connect } from 'react-redux'
import validator from 'validator'
import {
  closeModal,
  updateTagInvitationEditor,
  sendCommunityTagInvitation,
  fetchCommunitySettings,
  typeahead
} from '../actions'
import { SEND_COMMUNITY_TAG_INVITATION } from '../actions/constants'
import { Modal } from '../components/Modal'
import ModalRow from '../components/ModalRow'
import Avatar from '../components/Avatar'
import { KeyControlledItemList } from '../components/KeyControlledList'
import { communityTagJoinUrl } from '../routes'
import { getKeyCode, keyMap } from '../util/textInput'
import { compact, get, isEmpty, some } from 'lodash'
import { filter, includes, map, flow, curry } from 'lodash/fp'
import cx from 'classnames'
import copy from 'copy-to-clipboard'

const { func, string, object, bool, array } = React.PropTypes

@connect(({ communities, tagInvitationEditor, pending }, { slug }) => ({
  community: communities[slug],
  tagInvitationEditor,
  pending: pending[SEND_COMMUNITY_TAG_INVITATION]

}))
export default class ShareTopicModal extends React.Component {
  static propTypes = {
    dispatch: func,
    onCancel: func,
    tagName: string,
    slug: string,
    community: object,
    tagInvitationEditor: object,
    pending: bool
  }

  constructor (props) {
    super(props)
    this.state = {
      copied: false
    }
  }

  componentDidMount () {
    let { dispatch, slug, community } = this.props
    if (get(community, 'beta_access_code')) return
    dispatch(fetchCommunitySettings(slug))
  }

  render () {
    const { onCancel, tagName, community, dispatch, pending,
      tagInvitationEditor: { recipients, error, success } } = this.props

    const { copied } = this.state

    const joinUrl = get(community, 'beta_access_code')
      ? communityTagJoinUrl(community, tagName)
      : null

    const setError = text => dispatch(updateTagInvitationEditor('error', text))

    const update = curry((field, value) =>
      dispatch(updateTagInvitationEditor(field, value)))

    const addRecipient = recipient => {
      update('recipients', recipients.concat(recipient))
    }

    const removeRecipient = recipient => {
      const test = recipient.id
        ? r => r.id !== recipient.id
        : r => r !== recipient
      update('recipients', filter(test, recipients))
    }

    const submit = () => {
      if (isEmpty(recipients)) {
        return setError('Enter at least one email address or user.')
      }

      const emails = filter(r => !r.id, recipients)
      const badEmails = filter(e => !validator.isEmail(e), emails)
      if (some(badEmails)) {
        return setError(`These emails are invalid: ${badEmails.join(', ')}`)
      }

      setError(null)
      dispatch(sendCommunityTagInvitation(community.id, tagName, {
        users: compact(map('id', recipients)),
        emails: emails.join(',')
      }))
    }

    const copyLink = joinUrl
      ? () => copy(joinUrl) && this.setState({copied: true})
      : false

    const title = <span>
      Invite people to join <span className='hashtag'>#{tagName}</span>
    </span>

    return <Modal title={title} id='share-topic-modal'
      onCancel={onCancel}>
      <div className='join-url'>
        Anyone with this link can join.
        {copyLink
          ? <span>
              &nbsp;
              <a className='copy-link' onClick={copyLink}>Copy Link</a>
              {copied && <span className='copied'> (copied)</span>}
            </span>
          : <span> Loading...</span>}
      </div>
      <HybridInviteInput recipients={recipients}
        communityId={community.id}
        typeaheadId='invite'
        removeRecipient={removeRecipient}
        addRecipient={addRecipient}
        />
      {error && <div className='alert alert-danger'>{error}</div>}
      {success && <div className='alert alert-success'>{success}</div>}
      <div className='footer'>
        <button onClick={() => dispatch(closeModal())}>Cancel</button>
        <button onClick={submit} className={cx({ok: !pending})}>
          {pending ? 'Sending...' : 'Invite'}
        </button>
      </div>
    </Modal>
  }
}

@connect(({ typeaheadMatches }, { typeaheadId }) => ({
  choices: typeaheadMatches[typeaheadId]
}))
class HybridInviteInput extends React.Component {

  static propTypes = {
    communityId: string,
    dispatch: func,
    recipients: array,
    addRecipient: func,
    removeRecipient: func,
    choices: array,
    typeaheadId: string
  }

  handleInput = event => {
    var { value } = event.target
    const {
      dispatch, typeaheadId, communityId, addRecipient
    } = this.props
    dispatch(typeahead(value, typeaheadId, {communityId, type: 'people'}))
    if (value.match(/,/)) {
      addRecipient(flow(
        map(e => e.trim()),
        filter(e => !isEmpty(e))
      )(value.split(',')))
      this.refs.input.value = ''
    }
  }

  handleKeys = event => {
    if (this.refs.list) {
      this.refs.list.handleKeys(event)
    } else {
      const code = getKeyCode(event)
      if (code === keyMap.ENTER || code === keyMap.TAB) {
        this.handleInput({target: {value: this.refs.input.value + ','}})
      }
    }
  }

  select = choice => {
    let { addRecipient } = this.props
    addRecipient(choice)
    this.refs.input.value = ''
    this.handleInput({target: {value: ''}})
  }

  render () {
    const { recipients, removeRecipient, choices } = this.props

    const newChoices = filter(c => !includes(c.id, map('id', recipients)), choices)

    const Recipient = ({ recipient }) => {
      if (recipient.id) {
        return <span className='recipient'>
          <Avatar person={recipient} />
          {recipient.name} <a className='remove'
            onClick={() => removeRecipient(recipient)}>&times;</a>
        </span>
      } else {
        return <span className='recipient'>
          {recipient} <a className='remove'
            onClick={() => removeRecipient(recipient)}>&times;</a>
        </span>
      }
    }

    const placeholder = isEmpty(recipients)
      ? 'Enter name or email to invite, use commas to separate.'
      : ''

    const onFocus = () => this.refs.row.focus()
    const onBlur = () => this.refs.row.blur()
    return <ModalRow className='recipient-input' ref='row' field={this.refs.input}>
      <span className='recipients'>
        {recipients.map(r => <Recipient recipient={r} key={r.id || r} />)}
      </span>
      <input type='text'
        className={cx({full: isEmpty(recipients)})}
        ref='input'
        placeholder={placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={this.handleInput}
        onKeyDown={this.handleKeys}
        />
      {!isEmpty(newChoices) && <div className='dropdown active'>
        <KeyControlledItemList className='dropdown-menu' ref='list' items={newChoices} onChange={this.select} />
      </div>}
    </ModalRow>
  }
}
