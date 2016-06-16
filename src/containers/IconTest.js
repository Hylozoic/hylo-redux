import React from 'react'
import { connect } from 'react-redux'
import { showShareTag } from '../actions/tags'
const { func } = React.PropTypes

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

@connect()
export default class IconTest extends React.Component {

  static propTypes = {
    dispatch: func
  }

  render () {
    let { dispatch } = this.props

    return <div id='icon-test'>
      <button onClick={() => dispatch(showShareTag())}>Share</button>
      {classNames.map(cn => <span key={cn}>
        <span className={cn}/> {cn.replace(/icon-/, '')}
      </span>)}
      <p>{classNames.length} icons</p>
    </div>
  }
}
