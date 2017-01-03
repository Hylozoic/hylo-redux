import React from 'react'
import { connect } from 'react-redux'
import { get, flow, pick, map } from 'lodash/fp'
import { sendGraphqlQueryAddDataToStore } from '../actions/graphql'
import { connectedListProps } from '../util/caching'

const { func, object, array } = React.PropTypes

const fetchPopularSkills = slug =>
  sendGraphqlQueryAddDataToStore(slug, `{
    community(slug: "${slug}") {
      slug
      popularSkills(first: 4)
      members(first: 3) {
        id
        avatarUrl
      }
    }
  }`, {
    communities: flow(get('community'), pick(['slug', 'popularSkills']), c => [c]),
    people: get('community.members'),
    peopleByQuery: flow(
      get('community.members'),
      map('id'),
      ids => ({[`subject=community&id=${slug}`]: ids}))
  })

@connect((state, { community }) =>
  connectedListProps(state, {subject: 'community', id: community.slug}, 'people'))
export default class PopularSkillsModule extends React.PureComponent {

  static propTypes = {
    people: array,
    community: object
  }

  static contextTypes = {
    dispatch: func
  }

  componentDidMount () {
    const { community, dispatch } = this.props
    dispatch(fetchPopularSkills(community.slug))
  }

  render () {
    const { community, people } = this.props
    const popularSkills = community.popularSkills || []

    return <span>
      Popular Skills
      <ul>
        {popularSkills.map(ps => <li key={ps}>{ps}</li>)}
      </ul>
      Users
      <ul>
        {people.map(p => <li key={p.id}>{p.id}</li>)}
      </ul>
    </span>
  }
}
