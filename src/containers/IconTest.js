import React from 'react'

const classNames = [
  'icon-AddContacts',
  'icon-Bell',
  'icon-Bookmark',
  'icon-Box-Out',
  'icon-Calendar',
  'icon-Calendar-Add',
  'icon-Camera',
  'icon-Chevon-Left',
  'icon-Chevron-Down',
  'icon-Chevron-Right',
  'icon-Chevron-Up',
  'icon-Clock',
  'icon-Cloud-Download',
  'icon-Cloud-Upload',
  'icon-Comment',
  'icon-Comment-Alt',
  'icon-Compose',
  'icon-Heart',
  'icon-Heart2',
  'icon-Help',
  'icon-JunkBox',
  'icon-Keypad',
  'icon-Like',
  'icon-Link',
  'icon-List',
  'icon-Lock',
  'icon-Loudspeaker',
  'icon-Loupe',
  'icon-Mail',
  'icon-Message-Smile',
  'icon-More',
  'icon-More-Alt',
  'icon-Pencil',
  'icon-Pin-1',
  'icon-Pin-2',
  'icon-ProjectorScreen',
  'icon-Settings',
  'icon-Star',
  'icon-Tag',
  'icon-Trash',
  'icon-Users',
  'icon-VideoCamera',
  'icon-View',
  'icon-big-check',
  'icon-facebook',
  'icon-hylo-script',
  'icon-linkedin',
  'icon-merkaba',
  'icon-twitter'
]

export default class IconTest extends React.Component {
  render () {
    return <div id='icon-test'>
      {classNames.map(cn => <span key={cn}>
        <span className={cn}/> {cn.replace(/icon-/, '')}
      </span>)}
      <p>{classNames.length} icons</p>
    </div>
  }
}
