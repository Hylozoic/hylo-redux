import React from 'react'
const { bool, object } = React.PropTypes
import A from './A'
import Dropdown from './Dropdown'

export default class PersonListItem extends React.Component {
  static propTypes = {
    person: object,
    isModerator: bool,
    viewerIsModerator: bool
  }

  render () {
    let { isModerator, person, viewerIsModerator } = this.props
    return <div className='person-list-item' onClick={this.expand}>
      <div className='person-info'>
        <A to={`/u/${person.id}`}>
          <div className='large-avatar' style={{backgroundImage: `url(${person.avatar_url})`}}>
            {isModerator && <span className='moderator-label'>moderator</span>}
          </div>
        </A>
        {viewerIsModerator && <Dropdown className='contributor-menu' alignRight={true} toggleChildren={
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
      {person.bio && <div className='details'>{person.bio}</div>}
    </div>
  }
}

const SocialMediaLinks = props => {
  return <div className='social-media-links'>
  </div>
}
