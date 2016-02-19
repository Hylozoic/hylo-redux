import React from 'react'
import cx from 'classnames'

const Tags = ({ children, className, onClick }) =>
  <ul className={cx('tags', className)}>
    {children.map(tag =>
      <div className={cx('tag', onClick ? 'clickable' : null)}
        key={tag} onClick={() => onClick(tag)}>
        {tag}
      </div>)}
  </ul>

export default Tags
