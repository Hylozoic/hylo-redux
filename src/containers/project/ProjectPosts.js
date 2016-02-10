import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import PostEditor from '../../components/PostEditor'
import { includes } from 'lodash'
const { object, string } = React.PropTypes

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

  static childContextTypes = {
    postDisplayMode: string,
    project: object
  }

  getChildContext () {
    let { project } = this.props
    return {postDisplayMode: 'project', project}
  }

  render () {
    let { location: { query }, params: { id }, currentUser, project } = this.props

    let { contributors, user } = project
    let canPost = currentUser && (
      user.id === currentUser.id ||
      includes(contributors.map(c => c.id), currentUser.id)
    )

    return <div>
      {canPost && <PostEditor project={project}/>}
      <ConnectedPostList {...{subject, id, query}}/>
    </div>
  }
}
