import React from 'react'
import Select from './Select'
import A from './A'
import { debounce } from 'lodash'

const filters = [
  {name: 'All projects', id: 'all'},
  {name: 'Projects I started or joined', id: 'mine'}
]

const ProjectListControls = props => {
  const { onChange, filter, search } = props
  const selectedFilter = filter ? filters.find(t => t.id === filter) : filters[0]
  const changeSearch = ({ target: { value } }) => delaySearch(value)
  const delaySearch = debounce(search => onChange({search}), 500)

  return <div className='list-controls'>
    <A className='button' to='/project/new'>
      <i className='icon-add-01'></i>
      New Project
    </A>
    <input type='text' className='form-control search'
      placeholder='Search' defaultValue={search}
      onChange={changeSearch}/>

    <Select className='type' choices={filters} selected={selectedFilter}
      onChange={t => onChange({filter: t.id})} alignRight={true}/>
  </div>
}

export default ProjectListControls
