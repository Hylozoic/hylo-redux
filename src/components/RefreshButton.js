import React from 'react'
import { throttle } from 'lodash'
import { VelocityTransitionGroup } from 'velocity-react'
import { position, viewportTop } from '../util/scrolling'
import { nounCount } from '../util/text'
import cx from 'classnames'
const { func, number } = React.PropTypes

export default class RefreshButton extends React.Component {
  static propTypes = {
    refresh: func,
    count: number
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
    this.startingY = position(this.refs.placeholder).y - 5
    this.setState({isStatic: viewportTop() < this.startingY})
    window.addEventListener('scroll', this.handleScrollEvents)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.handleScrollEvents)
  }

  render () {
    const { refresh, count } = this.props
    const { isStatic } = this.state
    const classes = cx('refresh-button', {static: isStatic, floating: !isStatic})
    return <div ref='placeholder'>
      <VelocityTransitionGroup
        enter={{animation: 'slideDown'}}
        leave={{animation: 'slideUp'}}>
        {refresh && <div className='refresh-button-container'>
          <div onClick={refresh} className={classes}
            ref='refresh-button'>
            {nounCount(count, 'new post')}
          </div>
        </div>}
      </VelocityTransitionGroup>
    </div>
  }
}
