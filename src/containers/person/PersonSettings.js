import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import cx from 'classnames'
const { func, object } = React.PropTypes
import { fetchCurrentUser, updatePersonSettings, updatePersonSettingsEditor } from '../../actions'

@prefetch(({ dispatch, params: {id} }) => dispatch(fetchCurrentUser()))
@connect(({ people }, props) => ({currentUser: people.current}))
export default class PersonSettings extends React.Component {
  static propTypes = {
    currentUser: object,
    dispatch: func
  }

  updateStore (data) {
    let { dispatch } = this.props
    dispatch(updatePersonSettingsEditor(data))
  }

  setEmail = event =>
    this.updateStore({email: event.target.value})

  save = () => {
    let { dispatch, currentUser } = this.props
    dispatch(updatePersonSettings(currentUser))
  }

  cancel = () => {

  }

  render () {
    // let { currentUser, dispatch, params: { id }, location: { query } } = props
    // let { type, sort, search } = query
    let { currentUser } = this.props
    let { email } = currentUser

    return <div className={cx('person-settings', 'clearfix')}>
      <p>Settings for {currentUser.name}</p>
      <label>
        <p>Email</p>
        <input type='text' ref='email' className='email form-control'
          value={email}
          onChange={this.setEmail}/>
      </label>
      <div className='buttons'>
        <div className='right'>
          <button onClick={this.cancel}>Cancel</button>
          <button className='btn-primary' onClick={this.save}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  }

}
