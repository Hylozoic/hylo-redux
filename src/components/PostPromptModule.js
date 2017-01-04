import React from 'react'
import { showModal } from '../actions'
import { coinToss } from '../util'
import Icon from './icon'
const { func, bool } = React.PropTypes
import cx from 'classnames'

export default class PostPromptModule extends React.PureComponent {

  static contextTypes = {
    dispatch: func,
    isMobile: bool
  }

  constructor (props) {
    super(props)
    this.state = {open: false}
  }

  render () {
    var title
    var body

    const { dispatch, isMobile } = this.context

    const tag = coinToss() ? 'offer' : 'request'
    const openPostEditor = () => dispatch(showModal('post-editor', {tag}))

    switch (tag) {
      case 'offer':
        title = <div className='title'>
          Have something you want to share?<br />
          Make an #offer!
        </div>
        body = <div className={cx('body', {isMobile})}>
          An Offer is what you’d like to share with your<br />
          community. It can be ideas, skills, physical goods,<br />
          or anything else you can think of.
        </div>
        break
      case 'request':
        title = <div className='title'>
          Looking for something in particular?<br />
          Make an #request!
        </div>
        body = <div className={cx('body', {isMobile})}>
          You can use Requests to ask your community for<br />
          what you need. What are you looking for that<br />
          your community might help you with?
        </div>
    }

    const { open } = this.state

    return <div className='post post-prompt'>
      {title}
      {open && body}
      <div><button onClick={openPostEditor}>Post</button></div>
      {!open && <Icon name='Chevron-Down2' onClick={() => this.setState({open: true})} />}
    </div>
  }
}
