import React from 'react'
const { object } = React.PropTypes
import A from './A'
import Dropdown from './Dropdown'

export default class PersonListItem extends React.Component {
  static propTypes = {
    person: object
  }

  render () {
    let { person } = this.props
    var isModerator = person.membership.role === 1
    var canModerate = true
    return <div className='user-list-item' onClick={this.expand}>
      <div className='user-info'>
        <A to={`/u/${person.id}`}>
          <div className='large-avatar' style={{backgroundImage: `url(${person.avatar_url})`}}>
            {isModerator && <span className='moderator-label'>moderator</span>}
          </div>
        </A>
        {canModerate && <Dropdown className='contributor-menu' alignRight={true} toggleChildren={
          <i className='icon-down'></i>
        }>
          <li>
            {isModerator
              ? <a onClick={() => window.alert('TODO')}>Remove moderator power</a>
              : <a onClick={() => window.alert('TODO')}>Grant moderator power</a>}
          </li>
          <li><a onClick={() => window.alert('TODO')}>Remove</a></li>
        </Dropdown>}

        <A className='name' to={`/u/${person.id}`}>{person.name}</A>
        <SocialMediaLinks person={person} />

      </div>
      {person.bio && <div className='details post-section'>{person.bio}</div>}
    </div>
  }
}

const SocialMediaLinks = props => {
  return <div className='social-media-links'>
  </div>
}
