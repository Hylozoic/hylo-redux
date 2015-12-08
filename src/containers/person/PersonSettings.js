import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
const { func, object } = React.PropTypes
import { fetchCurrentUser } from '../../actions'

@prefetch(({ dispatch, params: {id} }) => dispatch(fetchCurrentUser()))
@connect(({ people }, props) => ({currentUser: people.current}))
export default class PersonSettings extends React.Component {
  static propTypes = {
    currentUser: object,
    dispatch: func
  }

  render () {
    // let { currentUser, dispatch, params: { id }, location: { query } } = props
    // let { type, sort, search } = query
    let { currentUser } = this.props

    return <div>
      Settings for {currentUser.name}
    </div>
  }

}

// export default connect(({ people }, props) => ({currentUser: people.current}))(PersonSettings)
