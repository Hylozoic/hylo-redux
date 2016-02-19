import React from 'react'
import cx from 'classnames'

const Tags = ({ children, className }) =>
  <ul className={cx('tags', className)}>
    {children.map(tag => <div className='tag' key={tag}>{tag}</div>)}
  </ul>

export default Tags
