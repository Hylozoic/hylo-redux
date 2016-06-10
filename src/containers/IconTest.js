import React from 'react'
import TagLink from '../components/TagLink'

const classNames = [
  'icon-AddContacts',
  'icon-Bell',
  'icon-Bookmark',
  'icon-Box-Out',
  'icon-Calendar',
  'icon-Calendar-Add',
  'icon-Camera',
  'icon-Chevron-Left',
  'icon-Chevron-Down',
  'icon-Chevron-Right',
  'icon-Chevron-Up',
  'icon-Clock',
  'icon-Cloud-Download',
  'icon-Cloud-Upload',
  'icon-Comment',
  'icon-Comment-Alt',
  'icon-Compose',
  'icon-Fail',
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
  'icon-User',
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
      <br />
      <br />
      <br />
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque at ligula quis mauris viverra consequat. Mauris a dolor lectus. Aliquam gravida lacus commodo urna dapibus, in facilisis tellus placerat. Mauris id facilisis quam. Curabitur sodales mauris risus, eu dignissim quam venenatis a. <TagLink tagName='woo' slug='hylo' /> Pellentesque aliquam et odio eu hendrerit. Duis vehicula vehicula sem at rutrum. Vestibulum vestibulum nibh quis diam sollicitudin accumsan. Quisque commodo metus sed dui convallis, nec gravida lorem varius. Maecenas a quam orci. In faucibus tempus ligula, ut semper dolor mattis at. Donec sagittis metus finibus facilisis posuere. Aenean eleifend dui nisl, sit amet molestie libero facilisis faucibus.
      <br />
      <br />
      <br />
      {classNames.map(cn => <span key={cn}>
        <span className={cn}/> {cn.replace(/icon-/, '')}
      </span>)}
      <p>{classNames.length} icons</p>
    </div>
  }
}
