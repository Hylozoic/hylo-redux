import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchPeople } from '../../actions/fetchPeople'
import { fetchWithCache, connectedListProps } from '../../util/caching'
import PersonListItem from '../../components/PersonListItem'
import A from '../../components/A'
import qs from 'querystring'
import { contains } from 'lodash'
const { array, object } = React.PropTypes

const subject = 'project'
const fetch = fetchWithCache(fetchPeople)

@prefetch(({ dispatch, params: { id }, query }) => dispatch(fetch(subject, id, query)))
@connect((state, { params: { id }, location: { query } }) => {
  let moderators = state.peopleByQuery[qs.stringify({subject: 'project-moderators', id})]

  return {
    ...connectedListProps(state, {subject, id, query}, 'people'),
    project: state.projects[id],
    moderators
  }
})
export default class ProjectContributors extends React.Component {
  static propTypes = {
    people: array,
    project: object,
    moderators: array
  }

  render () {
    let { people, project, moderators } = this.props
    let canModerate = true // TODO

    return <div>
      <div className='invite-cta'>
        Invite friends and community members to help out.
        {project && <A className='button' to={`/project/${project.id}/${project.slug}/invite`}>
          + Invite contributors
        </A>}
      </div>
      {people.map(person => <PersonListItem person={person} key={person.id}
        isModerator={contains(moderators, person.id)}
        viewerIsModerator={canModerate}/>)}
    </div>
  }
}
