import React from 'react'
import Masonry from 'react-masonry-component'
import ProjectCard from '../components/ProjectCard'

const ProjectCardContainer = props => {
  let { projects } = props
  return <div className='masonry-container project-card-container'>
    <Masonry options={{transitionDuration: 0}}>
      {projects.map(p => <div className='masonry-item-wrapper' key={p.id}>
        <ProjectCard project={p}/>
      </div>)}
    </Masonry>
  </div>
}

export default ProjectCardContainer
