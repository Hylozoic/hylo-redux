import React from 'react'
import { connect } from 'react-redux'
import { debounce, keys, isEmpty, map } from 'lodash'
import { closeModal } from '../actions'
import { editTagDescription, editNewTagAndDescription } from '../actions'
import { createTagInCommunity } from '../actions/tags'
import { updateCommunityChecklist } from '../actions/communities'
import { Modal } from '../components/Modal'
import ModalRow, { ModalInput } from '../components/ModalRow'
import { getCurrentCommunity } from '../models/community'
import { hashtagWordRegex } from '../models/hashtag'
import { canModerate } from '../models/currentUser'
import cx from 'classnames'
const { func, object, bool } = React.PropTypes

@connect((state, props) => ({
  tags: state.tagDescriptionEdits,
  community: getCurrentCommunity(state)
}))
export default class TagEditorModal extends React.Component {
  static propTypes = {
    tags: object,
    saveParent: func,
    useCreatedTag: func,
    dispatch: func,
    creating: bool,
    community: object
  }

  static contextTypes = {currentUser: object}

  render () {
    let {
      tags, saveParent, useCreatedTag, dispatch, creating, community
    } = this.props
    const { currentUser } = this.context
    const cancel = () => dispatch(closeModal())
    const editAction = creating ? editNewTagAndDescription : editTagDescription
    const edit = debounce((tag, value, is_default) =>
      dispatch(editAction(tag, value, is_default)), 200)

    useCreatedTag = useCreatedTag || ((params) => {
      const { dispatch, community: { slug } } = this.props
      const name = Object.keys(params)[0]
      dispatch(createTagInCommunity({...params[name], name}, slug))
    })

    if (isEmpty(tags)) {
      if (!creating) return null
      tags = {'': {description: '', is_default: false}}
    }

    const validate = tags => {
      // only called when creating a tag so we can assume there is exactly one tag
      let tag = keys(tags)[0]
      if (tag[0].match(/[^A-Za-z]/)) {
        window.alert('Topic names must start with a letter')
        return false
      } else if (tag.length < 2) {
        window.alert('Topic names must be at least 2 characters')
        return false
      } else if (!tag.match(hashtagWordRegex)) {
        window.alert('Topic names can only use letters, numbers and underscores, with no spaces.')
        return false
      }
      return true
    }

    const createTag = () => {
      if (!validate(tags)) return
      useCreatedTag(tags)
      dispatch(updateCommunityChecklist(community.slug))
      cancel()
    }

    const saveTag = () => {
      saveParent(tags)
      cancel()
    }

    const title = `Hey, you're creating ${keys(tags).length > 1 ? 'new topics.' : 'a new topic.'}`

    return <Modal id='tag-description-editor' title={title} onCancel={cancel}>
        {map(tags, ({ description, is_default }, tag) =>
          <div key={creating ? 'key' : tag} className={cx('tag-group', {creating})}>
            {creating
              ? <ModalInput label='Topic name' defaultValue={tag}
              onChange={event => edit(event.target.value, description, is_default)}/>
              : <div className='topic'>
                  <label>Topic name</label>
                  <span>#{tag}</span>
                </div>}
            <ModalInput label='Description' defaultValue={description}
              onChange={event => edit(tag, event.target.value, is_default)}/>
            {canModerate(currentUser, community) && <ModalRow
              ref='default'>
              <label>Make default</label>
              <input type='checkbox'
                value='def'
                defaultChecked={is_default}
                onChange={event => edit(tag, description, !is_default)}
                onFocus={() => this.refs.default.focus()}
                onBlur={() => this.refs.default.blur()}/>
              Make this a default topic for your community.
              <p className='meta help-text'>When a topic is set as default, it shows up in the topic dropdown menu for new posts, and all new members start out following that topic.</p>
            </ModalRow>}
          </div>)}
        <div className='footer'>
          <button onClick={creating ? createTag : saveTag}
            className='ok'>
            Create
          </button>
        </div>
      </Modal>
  }
}
