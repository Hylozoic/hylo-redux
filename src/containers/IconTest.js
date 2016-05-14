import React from 'react'

const classNames = [
  'icon-Camera',
  'icon-Comment-Alt',
  'icon-Message-Smile',
  'icon-Comment',
  'icon-Keypad',
  'icon-Loudspeaker',
  'icon-JunkBox',
  'icon-Box-Out',
  'icon-Mail',
  'icon-AddContacts',
  'icon-Users',
  'icon-Chevron-Up',
  'icon-Chevon-Left',
  'icon-Chevron-Down',
  'icon-Chevron-Right',
  'icon-List',
  'icon-Calendar-Add',
  'icon-Calendar',
  'icon-Bell',
  'icon-Clock',
  'icon-Cloud-Download',
  'icon-Cloud-Upload',
  'icon-Pin-2',
  'icon-Loupe',
  'icon-View',
  'icon-More-Alt',
  'icon-More',
  'icon-Bookmark',
  'icon-Heart',
  'icon-Like',
  'icon-Star',
  'icon-Trash',
  'icon-Compose',
  'icon-Lock',
  'icon-pencil',
  'icon-Link',
  'icon-merkaba',
  'icon-hylo-script',
  'icon-twitter',
  'icon-facebook',
  'icon-linkedin'
].reverse()

export default class IconTest extends React.Component {
  render () {
    return <div>
      {classNames.map(cn => <span key={cn} className={cn} />)}
    </div>
  }
}
