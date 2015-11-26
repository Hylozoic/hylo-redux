import React from 'react'
import Dropdown from './Dropdown'
import { debounce } from 'lodash'
const { bool, func, string } = React.PropTypes

const postTypeChoices = [
  {name: 'All Posts', id: 'all+welcome'},
  {name: 'All Posts', id: 'all'},
  {name: 'Intentions', id: 'intention'},
  {name: 'Offers', id: 'offer'},
  {name: 'Requests', id: 'request'},
  {name: 'Chats', id: 'chat'}
]

const sorts = [
  {name: 'Recent', id: 'recent'},
  {name: 'Top', id: 'top'}
]

const PostListControls = props => {
  let { includeWelcome, sort, type, onChange } = props
  let selectedType = postTypeChoices.find(t => t.id === type)
  let types = postTypeChoices.filter(t => t.id !== (includeWelcome ? 'all' : 'all+welcome'))
  let selectedSort = sorts.find(s => s.id === sort)

  return <div className='post-list-controls'>
    <input type='text' className='form-control search'
      placeholder='Search'
      onInput={debounce(event => onChange({search: event.target.value}), 500)}/>

    <Dropdown className='type' choices={types} selected={selectedType}
      onChange={t => onChange({type: t.id})}/>

    <Dropdown choices={sorts} selected={selectedSort}
      onChange={s => onChange({sort: s.id})}/>
  </div>
}

PostListControls.propTypes = {
  onChange: func,
  sort: string,
  type: string,
  includeWelcome: bool
}

export default PostListControls
