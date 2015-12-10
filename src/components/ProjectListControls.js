import React from 'react'
import Select from './Select'
import A from './A'
import { debounce } from 'lodash'

const projectTypes = [
  {name: 'All projects', id: 'all'},
  {name: 'Projects I started or joined', id: 'mine'}
]

const ProjectListControls = props => {
  let { onChange, type, search } = props
  let selectedType = type ? projectTypes.find(t => t.id === type) : projectTypes[0]

  return <div className='list-controls'>
    <A className='button' to='/project/new'>
      <i className='icon-add-01'></i>
      New Project
    </A>
    <input type='text' className='form-control search'
      placeholder='Search' defaultValue={search}
      onChange={debounce(event => onChange({search: event.target.value}), 500)}/>

    <Select className='type' choices={projectTypes} selected={selectedType}
      onChange={t => onChange({type: t.id})} alignRight={true}/>
  </div>
}

export default ProjectListControls
