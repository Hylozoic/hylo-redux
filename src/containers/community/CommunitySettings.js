import React from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'
const { object, func } = React.PropTypes
import { updateCommunitySettings } from '../../actions'

@connect((state, { params }) => ({community: state.communities[params.id]}))
export default class CommunitySettings extends React.Component {

  constructor (props) {
    super(props)
    this.state = {editing: {}, edited: {}, errors: {}, expand: {}}
  }

  static propTypes = {
    community: object,
    dispatch: func,
    location: object
  }

  setName = event => {
    return this.setState({
      edited: {...this.state.edited, name: event.target.value},
      errors: {...this.state.errors, name: !event.target.value}
    })
  }

  validate () {
    let { errors } = this.state

    if (errors.name) {
      window.alert('Please provide a community name.')
      this.refs.name.focus()
      return
    }

    return true
  }

  save = (field) => {
    if (!this.validate()) return

    let { dispatch, community } = this.props
    let { editing, edited } = this.state
    this.setState({editing: {...editing, [field]: false}})
    dispatch(updateCommunitySettings({...community, ...edited}, {[field]: community[field]}))
  }

  edit (field) {
    let { community } = this.props
    let { editing, edited } = this.state
    edited[field] = community[field]
    this.setState({editing: {...editing, [field]: true}})
  }

  cancelEdit (field) {
    let { editing } = this.state
    this.setState({editing: {...editing, [field]: false}})
  }

  toggleSection (section, open) {
    let { expand } = this.state
    this.setState({expand: {...expand, [section]: open || !expand[section]}})
  }

  componentDidMount () {
    let { location: { query } } = this.props
    let { expand } = query || {}
    switch (expand) {
      default:
        this.toggleSection('appearance', true)
        break
    }
  }

  render () {
    let { community } = this.props
    let { editing, edited, errors, expand } = this.state

    return <div className='sections'>
      <div className='section-label' onClick={() => this.toggleSection('appearance')}>
        Appearance
        <i className={cx({'icon-down': expand.appearance, 'icon-right': !expand.appearance})}></i>
      </div>
      {expand.appearance && <div className='section name'>
        <div className='section-item'>
          <div className='half-column'>
            <label>Name</label>
            <p>{community.name}</p>
          </div>
          {!editing.name && <div className='half-column value'>
            <button type='button' onClick={() => this.edit('name')}>Change</button>
          </div>}
          {editing.name && <div className='half-column value'>
            <form name='nameForm'>
              <div className={cx('form-group', {'has-error': errors.name})}>
                <input type='text' ref='name' className='name form-control'
                  value={edited.name}
                  onChange={this.setName}/>
                </div>
            </form>
            <div className='buttons'>
              <button type='button' onClick={() => this.cancelEdit('name')}>Cancel</button>
              <button type='button' className='btn-primary' onClick={() => this.save('name')}>Save</button>
            </div>
          </div>}
        </div>
      </div>}
    </div>
  }
}
