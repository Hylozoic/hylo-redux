import React from 'react'
import Post from './Post'

const ProjectActivityCard = (props, context) => {
  const { onExpand } = props
  const { newActivity } = props.post
  const { post } = newActivity
  return <div>
    <Post post={post} onExpand={onExpand} />
  </div>
}

export default ProjectActivityCard
