import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchProject } from '../../actions'
const { object } = React.PropTypes

@prefetch(({ dispatch, params: { id } }) => dispatch(fetchProject(id)))
@connect(({ projects }, { params: { id } }) => ({
  project: projects[id]
}))
export default class ProjectEditor extends React.Component {
  static propTypes = {
    project: object
  }

  render () {
    let { project } = this.props
    return <div>
      Editing project {project.id}
    </div>
  }
}
