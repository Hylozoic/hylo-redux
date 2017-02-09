import React from 'react'
import Icon from '../components/Icon'
import cx from 'classnames'
const { array, bool, func, node, object, string, oneOfType } = React.PropTypes

const mainColumnWidth = 688 // defined in CSS

// this has to cover the cases:
//  - desktop, left nav open
//  - desktop, left nav closed
//  - mobile
//
export const modalStyle = isMobile => {
  if (typeof window === 'undefined') return {}
  const main = document.getElementById('main')
  if (!main) return {} // this should be the case only during tests
  const marginLeft = Math.max((main.offsetWidth - mainColumnWidth) / 2, 0) + main.offsetLeft
  return {marginLeft}
}

export class ModalContainer extends React.Component {
  static propTypes = {
    id: string,
    children: oneOfType([array, object]),
    className: string,
    standalone: bool,
    style: object
  }

  static contextTypes = {
    isMobile: bool
  }

  componentDidMount () {
    this.refs.container.focus()
  }

  render () {
    const { id, className, children, standalone, style } = this.props
    const { isMobile } = this.context
    return <div id={id} className={cx(className, 'modal')}
      ref='container'
      tabIndex='0'
      style={style || (standalone ? {} : modalStyle(isMobile))}>
      {children}
    </div>
  }
}

export const Modal = (props, { isMobile }) => {
  const { children, title, subtitle, onCancel, standalone } = props
  return <ModalContainer {...props}>
    {(title || subtitle) && <div className='title'>
      <h2>
        {title}
        {!standalone && <a className='close' onClick={onCancel}>
          <Icon name='Fail' />
        </a>}
      </h2>
      {subtitle && <div className='subtitle'>
        {subtitle}
      </div>}
    </div>}
    {children}
  </ModalContainer>
}
Modal.propTypes = {
  id: string,
  children: oneOfType([array, object]),
  className: string,
  onCancel: func,
  subtitle: oneOfType([string, node]),
  standalone: bool,
  title: oneOfType([string, object])
}
Modal.contextTypes = {isMobile: bool}

export default Modal
