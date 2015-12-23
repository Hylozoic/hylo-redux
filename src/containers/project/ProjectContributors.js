import React from 'react'
import { connect } from 'react-redux'
import PersonListItem from '../../components/PersonListItem'
const { object } = React.PropTypes

// needs to prefetch contributors
@connect(({ people, projects }, { params: { id } }) => ({
  currentUser: people.current,
  project: projects[id]
}))
export default class ProjectContributors extends React.Component {
  static propTypes = {
    project: object,
    children: object
  }

  render () {
    let { project } = this.props
    let { contributors } = project

    return <div>
      <div className='invite-cta'>Invite friends and community members to help out. <a className='button' href='invite'>+ Invite contributors</a></div>
      {contributors.map(contributor => <PersonListItem personId={contributor.id} key={contributor.id}/>)}
    </div>
  }
}
