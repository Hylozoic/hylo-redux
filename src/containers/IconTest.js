import React from 'react'
import Icon from '../components/Icon'
import Dropdown from '../components/Dropdown'

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
  'Chevron-Right2'
]

export default class IconTest extends React.Component {

  render () {
    const childs = ['Porridge', 'Oatmeal', 'Gruel']

    return <div id='icon-test'>
      <Dropdown keyControlled toggleChildren={<span>Show Breakfasts</span>}>
        {childs.map(c => <li className={c} key={c}>
          <a onClick={() => console.log(c)}>{c}</a>
        </li>)}
      </Dropdown>
    </div>
  }
}
