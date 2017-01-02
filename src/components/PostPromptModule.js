import React from 'react'
import { showModal } from '../actions'
import { coinToss } from '../util'
import Icon from './icon'

export default class PostPromptModule extends React.PureComponent {

  static contextTypes = {
    dispatch: React.PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {open: false}
  }

  render () {
    var title
    var bodyText

    const { dispatch } = this.context

    const tag = 'offer' || (coinToss() ? 'offer' : 'request')
    const openPostEditor = () => dispatch(showModal('post-editor', {tag}))

    switch (tag) {
      case 'offer':
        title = <div className='title'>
          Have something you want to share?
          <br />
          Make an #offer!
        </div>
        bodyText = 'An Offer is what you’d like to share with your community. It can be ideas, skills, physical goods, or anything else you can think of.'
        break
      case 'request':
        title = <div className='title'>
          Looking for something in particular?
          <br />
          Make an #request!
        </div>
        bodyText = 'You can use Requests to ask your community for what you need. What are you looking for that your community might help you with? '
    }

    const { open } = this.state

    return <div className='post post-prompt'>
      {title}
      {open && <div className='body'>
        {bodyText}
      </div>}
      <button onClick={openPostEditor}>Post</button>
      {!open && <Icon name='Chevron-Down2' onClick={() => this.setState({open: true})} />}
    </div>
  }
}
