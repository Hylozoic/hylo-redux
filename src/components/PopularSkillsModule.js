import React from 'react'
import { connect } from 'react-redux'
import { get, flow, pick, map } from 'lodash/fp'
import { sendGraphqlQuery } from '../actions'
import { connectedListProps } from '../util/caching'
import Avatar from './Avatar'
import A from './A'
import { peopleUrl } from '../routes'

const { func, object, array } = React.PropTypes

const fetchPopularSkills = slug =>
  sendGraphqlQuery(`query ($slug: String) {
    community(slug: $slug) {
      slug
      popularSkills(first: 4)
      members(first: 3) {
        items {
          id
          avatarUrl
        }
      }
      memberCount
    }
  }`, {
    variables: {slug},
    addDataToStore: {
      communities: flow(get('community'), pick(['slug', 'popularSkills']), c => [c]),
      people: get('community.members.items'),
      peopleByQuery: flow(
        get('community.members.items'),
        map('id'),
        ids => ({[`subject=community&id=${slug}`]: ids})),
      totalPeopleByQuery: flow(
        get('community.memberCount'),
        t => ({[`subject=community&id=${slug}`]: t}))
    }
  })

export class PopularSkillsModule extends React.Component {
  static propTypes = {
    people: array,
    community: object
  }

  componentDidMount () {
    const { community, dispatch } = this.props
    dispatch(fetchPopularSkills(community.slug))
  }

  render () {
    const { community, people } = this.props
    const popularSkills = community.popularSkills || []

    return <div className='post popular-skills'>
      <div className='title'>Check out popular skills in the community!</div>
      <ul className='people'>
        {people.slice(0, 3).map(p => <li key={p.id}><Avatar person={p} /></li>)}
      </ul>
      <ul className='skills'>
        {popularSkills.map(skill => <li key={skill}>
          <A to={peopleUrl(community, `%23${skill}`)} className='hashtag'>#{skill}</A>
        </li>)}
      </ul>
      <A to={peopleUrl(community)} className='button'>See More</A>
    </div>
  }
}

export default connect(
  (state, { community }) => connectedListProps(state, {subject: 'community', id: community.slug}, 'people')
)(PopularSkillsModule)
