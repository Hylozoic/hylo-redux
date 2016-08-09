import React from 'react'
import { connect } from 'react-redux'
import { cancelTagDescriptionEdit, editTagDescription, editNewTagAndDescription } from '../actions'
import { debounce, keys, isEmpty, map } from 'lodash'
import { hashtagWordRegex } from '../models/hashtag'
import { BareModalWrapper, Modal } from './Modal'
import ModalInput from './ModalInput'
import cx from 'classnames'
const { func, object, bool } = React.PropTypes

@connect((state, props) => ({
  tags: state.tagDescriptionEdits,
  creating: state.creatingTagAndDescription
}))
export default class TagDescriptionEditor extends React.Component {
  static propTypes = {
    tags: object,
    saveParent: func,
    saveTagDescriptions: func,
    updatePostTag: func,
    dispatch: func,
    creating: bool
  }

  render () {
    let { tags, saveParent, updatePostTag, dispatch, creating } = this.props
    const cancel = () => dispatch(cancelTagDescriptionEdit())
    const editAction = creating ? editNewTagAndDescription : editTagDescription
    const edit = debounce((tag, value) =>
      dispatch(editAction(tag, value)), 200)

    if (isEmpty(tags)) {
      if (!creating) return null
      tags = {'': ''}
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
      updatePostTag(tags)
      cancel()
    }

    const title = `Hey, you're creating ${keys(tags).length > 1 ? 'new topics.' : 'a new topic.'}`

    return <BareModalWrapper>
      <Modal id='tag-description-editor' title={title}>
        {map(tags, (description, tag, i) =>
          <div key={creating ? i : tag} className={cx('tag-group', {creating})}>
            {creating
              ? <ModalInput label='Topic name' defaultValue={tag}
              onChange={event => edit(event.target.value, description)}/>
              : <div className='topic'>
                  <label>Topic name</label>
                  <span>#{tag}</span>
                </div>}
            <ModalInput label='Description' defaultValue={description}
              onChange={event => edit(tag, event.target.value)}/>
          </div>)}
        <div className='footer'>
          <button onClick={creating ? createTag : () => saveParent(tags)}
            className='ok'>
            Create
          </button>
        </div>
      </Modal>
    </BareModalWrapper>
  }
}
