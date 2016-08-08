import React from 'react'
import cx from 'classnames'

const ModalOnlyPage = ({ id, className, children }) => {
  return <div className={cx('modal-only-page', className)} id={id}>
    {children}
  </div>
}

export default ModalOnlyPage
