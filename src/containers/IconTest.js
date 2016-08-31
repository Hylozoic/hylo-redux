import React from 'react'
import Icon, { IconGoogleDrive } from '../components/Icon'

const names = [
  'AddContacts',
  'Bell',
  'Bookmark',
  'Box-Out',
  'Calendar',
  'Calendar-Add',
  'Camera',
  'Chevron-Left',
  'Chevron-Down',
  'Chevron-Right',
  'Chevron-Up',
  'Clock',
  'Cloud-Download',
  'Cloud-Upload',
  'Comment',
  'Comment-Alt',
  'Compose',
  'Fail',
  'Heart',
  'Heart2',
  'Help',
  'JunkBox',
  'Keypad',
  'Like',
  'Link',
  'List',
  'Lock',
  'Loudspeaker',
  'Loupe',
  'Mail',
  'Message-Smile',
  'More',
  'More-Alt',
  'Pencil',
  'Pin-1',
  'Pin-2',
  'ProjectorScreen',
  'Settings',
  'Star',
  'Tag',
  'Trash',
  'User',
  'Users',
  'VideoCamera',
  'View',
  'big-check',
  'facebook',
  'hylo-script',
  'linkedin',
  'merkaba',
  'twitter',
  'Chevron-Up2',
  'Chevron-Down2',
  'Chevron-Left2',
  'Chevron-Right2',
  'World'
]

export default class IconTest extends React.Component {

  render () {
    return <div id='icon-test'>
      {names.map(name => <span key={name}><Icon name={name}/> {name}</span>)}
      <span><IconGoogleDrive/> Google Drive</span>
      <p>{names.length} icons</p>
    </div>
  }
}
