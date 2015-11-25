import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetchPerson } from '../actions'
import { A, IndexA } from '../components/A'
const { object } = React.PropTypes

const defaultBanner = 'http://cdn.hylo.com/misc/default_user_banner.jpg'

@prefetch(({ dispatch, params: {id} }) => dispatch(fetchPerson(id)))
@connect((state, props) => ({person: state.people[props.params.id]}))
export default class PersonProfile extends React.Component {
  static propTypes = {
    params: object,
    person: object,
    children: object
  }

  render () {
    let person = this.props.person
    if (!person) return <div>Loading...</div>

    let bannerUrl = person.banner_url || defaultBanner
    return <div id='person'>
      <div className='banner'>
        <div className='background' style={{backgroundImage: `url(${bannerUrl})`}}/>
        <div className='logo person' style={{backgroundImage: `url(${person.avatar_url})`}}/>
        <h2>{person.name}</h2>
        <ul className='tabs'>
          <li><IndexA to={`/u/${person.id}`}>Posts</IndexA></li>
          <li><A to={`/u/${person.id}/about`}>About</A></li>
          <li><A to={`/u/${person.id}/contributions`}>Contributions</A></li>
          <li><A to={`/u/${person.id}/thanks`}>Thanks</A></li>
        </ul>
      </div>
      {this.props.children}
    </div>
  }
}
