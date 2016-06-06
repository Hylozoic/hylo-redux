import React from 'react'
import { connect } from 'react-redux'
import { cancelTagDescriptionEdit, editTagDescription } from '../actions'
import Icon from './Icon'
import { debounce, keys, isEmpty, map } from 'lodash'
const { func, object } = React.PropTypes

@connect((state, props) => ({
  tags: state.tagDescriptionEdits
}))
export default class TagDescriptionEditor extends React.Component {
  static propTypes = {
    tags: object,
    onSave: func,
    dispatch: func
  }

  render () {
    const { tags, onSave, dispatch } = this.props
    const cancel = () => dispatch(cancelTagDescriptionEdit())
    const edit = debounce((tag, value) =>
      dispatch(editTagDescription(tag, value)), 200)

    if (isEmpty(tags)) return null

    return <div id='tag-description-editor'>
      <div className='backdrop'/>
      <div className='modal'>
        <h2>
          Hey, you're creating&nbsp;
          {keys(tags).length > 1 ? 'new topics.' : 'a new topic.'}
          <a className='close' onClick={cancel}><Icon name='Fail'/></a>
        </h2>
        {map(tags, (description, tag) => <div key={tag} className='tag-group'>
          <div className='topic'>
            <label>Topic</label>
            <span>#{tag}</span>
          </div>
          <div className='description'>
            <label>Description</label>
            <input type='text' defaultValue={description}
              onChange={event => edit(tag, event.target.value)}/>
          </div>
        </div>)}
        <div className='footer'>
          <button onClick={() => onSave(tags)}>Create</button>
        </div>
      </div>
    </div>
  }
}
