import React from 'react'
import { connect } from 'react-redux'
// import { Link } from 'react-router'
const { object, string } = React.PropTypes
import Avatar from './Avatar'
import Link from 'react-router'

@connect(({ people }, { personId }) => {
  console.log('Connect', people)
  console.log('PersonId', personId)
  return { person: people[personId] }
})
export default class PersonListItem extends React.Component {
  static propTypes = {
    person: object,
    personId: string
  }

  render () {
    let { person } = this.props
    var isModerator = true
    var canModerate = true
    return <div className='user-list-item'>
      <Avatar person={person} />
      {isModerator && <span className='moderator-label'>moderator</span>}
      <div className='user-info'>
        {canModerate && <span className='caret-menu dropdown' dropdown>
          <a className='dropdown-toggle' dropdown-toggle><i className='icon-down'></i></a>
          <ul className='dropdown-menu'>
            <li>
              <a ng-show='toggleModerator' ng-click='toggleModerator(user, $index)'>
                <span ng-show='isModerator(user)'>Remove moderator power</span>
                <span ng-hide='isModerator(user)'>Grant moderator power</span>
              </a>
              <a ng-click='remove(user, $index)'>Remove</a>
            </li>
          </ul>
        </span>}

        <Link className='person' to={`/u/${person.id}`}><span>{person.name}</span></Link>
        <div className='user-links'>
          { /*
          <social-media user='::user' page=''members''></social-media>
          */}
        </div>
        {person.bio && <div className='bio'>
          <div className='full-column'>{person.bio}</div>
        </div>}
        {!person.bio && person.skills.length > 0 && <div className='skills'>
          <div className='title'>Skills:</div>
          <div className='clickable-links'>
            { /*
            <span ng-repeat='skill in ::user.skills track by $index'>
              <a onClick={() => this.search(skill)}}>{skill}</a><span ng-if='$index < user.skills.length-1'>,</span>
            </span>
            */ }
          </div>
        </div>}
        {!person.bio && person.organizations.length > 0 && <div className='affiliations'>
          <div className='title'>Groups:</div>
          <div className='clickable-links'>
            { /*
            <span ng-repeat='affiliation in ::user.organizations track by $index'>
              <a ng-click='search(affiliation)'>{{::affiliation}}</a><span ng-if='$index < user.organizations.length-1'>,</span>
            </span>
            */ }
          </div>
        </div>}
      </div>
    </div>
  }

}
