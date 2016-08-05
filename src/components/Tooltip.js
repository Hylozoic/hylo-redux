import React from 'react'
import { connect } from 'react-redux'
import ToolTip from 'react-portal-tooltip'
import { get, omit, sortBy, flow, toPairs, keys } from 'lodash/fp'
const { string, number, bool, object, func } = React.PropTypes
import { updateUserSettings, registerTooltip, unregisterTooltip } from '../actions'

export const activeTooltip = (currentUser, tooltips) => {
  const viewed = flow(
    get('settings.viewedTooltips'),
    keys
  )(currentUser)
  return flow(
    omit(viewed),
    toPairs,
    sortBy(tt => tt[1]),
    get('0.0')
  )(tooltips)
}

@connect(({ people, tooltips }, { id }) => {
  const currentUser = get('current', people)
  console.log('Tooltip id', id)
  console.log('currentUser', currentUser)
  console.log('activeTooltip', activeTooltip(currentUser, tooltips))
  return {
    active: activeTooltip(currentUser, tooltips) === id,
    currentUser
  }
})
export default class Tooltip extends React.Component {
  static propTypes = {
    id: string.isRequired,
    parentId: string,
    index: number.isRequired,
    title: string,
    body: string,
    active: bool,
    position: string,
    arrow: string,
    currentUser: object,
    dispatch: func
  }

  static defaultProps = {
    position: 'top',
    arrow: 'center'
  }

  componentDidMount () {
    const { dispatch, id, index } = this.props
    dispatch(registerTooltip(id, index))
  }

  componentWillUnmount () {
    const { dispatch, id } = this.props
    dispatch(unregisterTooltip(id))
  }

  render () {
    const {
      id, active, title, body, position, arrow, dispatch, currentUser, parentId
    } = this.props

    const ttid = `tooltip-id-${id}`
    const style = {
      style: {background: '#22bf99'},
      arrowStyle: {
        borderColor: false,
        color: '#22bf99'
      }
    }

    const close = () => {
      const settings = {
        viewedTooltips: {
          ...get('settings.viewedTooltips', currentUser),
          [id]: true
        }
      }
      dispatch(updateUserSettings(currentUser.id, {settings}))
    }

    return <span id={ttid}>
      <ToolTip
        active={active}
        parent={`#${parentId || ttid}`}
        position={position}
        arrow={arrow}
        style={style}>
        <div className='tooltip-content'>
          <div className='title'>{title}</div>
          <div className='body'>{body}</div>
          <div className='links'>
            <a onClick={() => close()}>Got it</a>
          </div>
        </div>
      </ToolTip>
    </span>
  }
}
