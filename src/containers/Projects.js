import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { debounce } from 'lodash'
import { fetch, ConnectedProjectList } from './ConnectedProjectList'
import { refetch } from '../util/caching'
import Select from '../components/Select'
const { func, object } = React.PropTypes

const subject = 'all'
const id = 'me' // just a placeholder; value isn't meaningful

const projectTypes = [
  {name: 'All projects', id: 'all'},
  {name: 'Projects I started or joined', id: 'mine'}
]

@prefetch(({ dispatch, params, query }) => dispatch(fetch(subject, id, query)))
@connect()
export default class Projects extends React.Component {
  static propTypes = {
    dispatch: func,
    location: object
  }

  changeQuery = opts => {
    let { dispatch, location } = this.props
    dispatch(refetch(opts, location))
  }

  render () {
    let { location: { query } } = this.props
    let { type, search } = query || {}
    let selectedType = type ? projectTypes.find(t => t.id === type) : projectTypes[0]

    return <div>
      <div className='row'>
        <div className='col-sm-6'>
          <h2>Projects</h2>
        </div>
        <div className='col-sm-6 list-controls'>
          <input type='text' className='form-control search'
            placeholder='Search' defaultValue={search}
            onChange={debounce(event => this.changeQuery({search: event.target.value}), 500)}/>

          <Select className='type' choices={projectTypes} selected={selectedType}
            onChange={t => this.changeQuery({type: t.id})} alignRight={true}/>
        </div>
      </div>

      <ConnectedProjectList {...{subject, id, query}}/>
    </div>
  }
}
