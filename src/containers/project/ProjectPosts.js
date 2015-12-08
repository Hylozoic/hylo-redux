import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import PostEditor from '../../components/PostEditor'
const { object } = React.PropTypes

const subject = 'project'

@prefetch(({ dispatch, params: { id }, query }) => dispatch(fetch(subject, id, query)))
@connect(({ people, projects }, { params: { id } }) => ({
  currentUser: people.current,
  project: projects[id]
}))
export default class ProjectPosts extends React.Component {
  static propTypes = {
    project: object,
    location: object,
    params: object,
    currentUser: object
  }

  render () {
    let { location: { query }, params: { id }, currentUser, project } = this.props
    return <div>
      {currentUser && <PostEditor project={project}/>}
      <ConnectedPostList {...{subject, id, query}}/>
    </div>
  }
}
