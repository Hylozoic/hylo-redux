import React from 'react'
import { throttle } from 'lodash'
import { VelocityTransitionGroup } from 'velocity-react'
import { position, viewportTop } from '../util/scrolling'
import cx from 'classnames'
const { func } = React.PropTypes

export default class RefreshButton extends React.Component {
  static propTypes = {
    refresh: func
  }
  constructor (props) {
    super(props)
    this.state = {isStatic: true}
  }
  handleScrollEvents = throttle(event => {
    event.preventDefault()
    if (this.state.isStatic) {
      if (viewportTop() > this.startingY) {
        this.setState({isStatic: false})
      }
    } else {
      if (viewportTop() < this.startingY) {
        this.setState({isStatic: true})
      }
    }
  }, 50)

  componentDidMount () {
    this.startingY = position(this.refs['placeholder']).y
    this.setState({isStatic: viewportTop() < this.startingY})
    window.addEventListener('scroll', this.handleScrollEvents)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.handleScrollEvents)
  }

  render () {
    let { refresh } = this.props
    let { isStatic } = this.state
    return <span ref='placeholder'>
      <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
        {refresh && <div onClick={refresh} className={cx('refresh-button', {'static': isStatic, 'floating': !isStatic})}
          ref='refresh-button'>
          New Posts are available. Refresh
        </div>}
      </VelocityTransitionGroup>
    </span>
  }
}
