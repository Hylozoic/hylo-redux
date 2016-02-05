import React from 'react'
import { contains } from 'lodash'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { MemberRole } from '../../models/project'
import { fetchPeople } from '../../actions/fetchPeople'
import { removeProjectContributor, toggleProjectModeratorRole } from '../../actions/project'
import { fetchWithCache, connectedListProps } from '../../util/caching'
import ScrollListener from '../../components/ScrollListener'
import PersonCards from '../../components/PersonCards'
import A from '../../components/A'
import qs from 'querystring'
const { array, bool, func, number, object } = React.PropTypes

const subject = 'project'
const fetch = fetchWithCache(fetchPeople)

@prefetch(({ dispatch, params: { id }, query }) => dispatch(fetch(subject, id, query)))
@connect((state, { params: { id }, location: { query } }) => {
  let moderators = state.peopleByQuery[qs.stringify({subject: 'project-moderators', id})]

  let currentUser = state.people.current
  let project = state.projects[id]
  let key = qs.stringify({subject: 'project-moderators', id})
  let canModerate = currentUser && (contains(state.peopleByQuery[key], currentUser.id) ||
    project.user.id === currentUser.id)

  return {
    ...connectedListProps(state, {subject, id, query}, 'people'),
    project,
    moderators,
    canModerate
  }
})
export default class ProjectContributors extends React.Component {
  static propTypes = {
    people: array,
    project: object,
    moderators: array,
    dispatch: func,
    total: number,
    pending: bool,
    params: object,
    location: object,
    canModerate: bool
  }

  loadMore = () => {
    let { people, dispatch, total, pending, params: { id }, location: { query } } = this.props
    let offset = people.length
    if (!pending && offset < total) {
      dispatch(fetch(subject, id, {...query, offset}))
    }
  }

  remove = personId => {
    let { project, dispatch } = this.props
    dispatch(removeProjectContributor(project.id, personId))
  }

  toggleModerator (personId) {
    let { project, moderators, dispatch } = this.props
    let role = contains(moderators, personId)
      ? MemberRole.DEFAULT
      : MemberRole.MODERATOR
    dispatch(toggleProjectModeratorRole(project.id, personId, role))
  }

  render () {
    let { people, project, moderators, canModerate } = this.props

    let menus = {}
    let subtitles = {}
    people.forEach(person => {
      let personIsModerator = contains(moderators, person.id)
      if (personIsModerator) subtitles[person.id] = 'moderator'

      if (canModerate) {
        menus[person.id] = [
          <li key='1'>
            <a onClick={() => this.toggleModerator(person.id)}>
              {personIsModerator ? 'Remove' : 'Grant'} moderator power
            </a>
          </li>,
          <li key='2'>
            <a onClick={() => this.remove(person.id)}>
              Remove from project
            </a>
          </li>
        ]
      }
    })

    return <div>
      <div className='invite-cta'>
        Invite friends and community members to help out.
        {project && <A className='button' to={`/project/${project.id}/${project.slug}/invite`}>
          + Invite contributors
        </A>}
      </div>
      <PersonCards people={people} menus={menus} subtitles={subtitles}/>
      <ScrollListener onBottom={this.loadMore}/>
    </div>
  }
}
