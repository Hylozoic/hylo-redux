import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchPeople } from '../../actions/fetchPeople'
import { fetchWithCache, connectedListProps } from '../../util/caching'
import PersonListItem from '../../components/PersonListItem'
const { array } = React.PropTypes

const subject = 'project'
const fetch = fetchWithCache(fetchPeople)

@prefetch(({ dispatch, params: { id }, query }) => dispatch(fetch(subject, id, query)))
@connect((state, { params: { id }, location: { query } }) => {
  return connectedListProps(state, {subject, id, query}, 'people')
})
export default class ProjectContributors extends React.Component {
  static propTypes = {
    people: array
  }

  render () {
    let { people } = this.props

    return <div>
      <div className='invite-cta'>Invite friends and community members to help out. <a className='button' href='invite'>+ Invite contributors</a></div>
      {people.map(contributor => <PersonListItem person={contributor} key={contributor.id}/>)}
    </div>
  }
}
