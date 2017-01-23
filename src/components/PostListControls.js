import React from 'react'
import Select from './Select'
import { debounce } from 'lodash'
const { bool, func, string } = React.PropTypes

const postTypes = [
  {name: 'All types', id: 'all+welcome'},
  {name: 'All types', id: 'all'},
  {name: 'Intentions', id: 'intention'},
  {name: 'Offers', id: 'offer'},
  {name: 'Requests', id: 'request'}
]

const sorts = [
  {name: 'Recent', id: 'recent'},
  {name: 'Top', id: 'top'}
]

const PostListControls = props => {
  let { includeWelcome, sort, type, search, onChange } = props
  let types = postTypes.filter(t => t.id !== (includeWelcome ? 'all' : 'all+welcome'))
  let selectedType = type ? types.find(t => t.id === type) : types[0]
  let selectedSort = sort ? sorts.find(s => s.id === sort) : sorts[0]
  let changeSearch = debounce(value => onChange({search: value}), 500)

  return <div className='list-controls'>
    <input type='text' className='form-control search'
      placeholder='Search' defaultValue={search}
      onChange={event => changeSearch(event.target.value)} />

    <Select className='type' choices={types} selected={selectedType}
      onChange={t => onChange({type: t.id})} alignRight={true} />

    <Select choices={sorts} selected={selectedSort}
      onChange={s => onChange({sort: s.id})} alignRight={true} />
  </div>
}

PostListControls.propTypes = {
  onChange: func,
  sort: string,
  type: string,
  search: string,
  includeWelcome: bool
}

export default PostListControls
