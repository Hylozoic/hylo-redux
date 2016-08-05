import React from 'react'
import { connect } from 'react-redux'
import ToolTip from 'react-portal-tooltip'
const { string, number, bool } = React.PropTypes
import { updateUserSettings } from '../actions'

const activeTooltip = (currentUser, tooltips) => {

}

@connect(({ currentUser, tooltips }, { id }))
export default class Tooltip extends React.Component {
  static propTypes = {
    id: string.isRequired,
    order: number,
    title: string,
    body: string,
    active: bool,
    position: string,
    arrow: string
  }

  static defaultProps = {
    position: 'top',
    arrow: 'center'
  }

  componentDidMount () {

  }

  render () {
    const { id, active, title, body, position, arrow, dispatch } = this.props

    const ttid = `tooltip-id-${id}`
    const style = {
      style: {background: '#22bf99'},
      arrowStyle: {
        borderColor: false,
        color: '#22bf99'
      }
    }

    const closeTooltip = id => {
      dispatch(updateUserSettings(currentUser.id))
    }


    return <span id={ttid}>
      <ToolTip
        active={active}
        parent={`#${ttid}`}
        position={position}
        arrow={arrow}
        style={style}>
        <div className='tooltip-content'>
          <div className='title'>{title}</div>
          <div className='body'>{body}</div>
          <div className='links'>
            <a onClick={() => console.log('Close ', id)}>Got it</a>
          </div>
        </div>
      </ToolTip>
    </span>
  }
}
