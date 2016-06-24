import React from 'react'
import { throttle } from 'lodash'
import { VelocityTransitionGroup } from 'velocity-react'
import { position, viewportTop } from '../util/scrolling'
import { nounCount } from '../util/text'
import cx from 'classnames'
const { func, number, bool } = React.PropTypes

export default class RefreshButton extends React.Component {
  static propTypes = {
    refresh: func,
    count: number
  }

  static contextTypes = {
    isMobile: bool
  }

  constructor (props) {
    super(props)
    this.state = {isStatic: true}
  }

  topNavHeight () {
    const { isMobile } = this.context
    if (isMobile) return 60
    return 75
  }

  handleScrollEvents = throttle(event => {
    event.preventDefault()
    if (this.state.isStatic) {
      if (viewportTop() + this.topNavHeight() > this.startingY) {
        this.setState({isStatic: false})
      }
    } else {
      if (viewportTop() + this.topNavHeight() < this.startingY) {
        this.setState({isStatic: true})
      }
    }
  }, 50)

  componentDidMount () {
    this.startingY = position(this.refs.placeholder).y - 5
    this.setState({isStatic: viewportTop() + this.topNavHeight() < this.startingY})
    window.addEventListener('scroll', this.handleScrollEvents)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.handleScrollEvents)
  }

  render () {
    const { refresh, count } = this.props
    const { isStatic } = this.state

    const classes = cx('refresh-button', {static: isStatic, floating: !isStatic})
    return <div className='placeholder' ref='placeholder'>
      <VelocityTransitionGroup
        enter={{animation: 'slideDown'}}
        leave={{animation: 'slideUp'}}>
        {refresh && <div className='refresh-button-container' ref='container'>
          <div onClick={refresh} className={classes}
            ref='refresh-button'>
            {nounCount(count, 'new post')}
          </div>
        </div>}
      </VelocityTransitionGroup>
    </div>
  }
}
