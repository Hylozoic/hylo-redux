import React from 'react'
import Dropdown from './Dropdown'
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

export default class PostListControls extends React.Component {
  static propTypes = {
    onChange: func,
    includeWelcome: bool,
    type: string,
    sort: string
  }

  render () {
    let { includeWelcome, sort, type, onChange } = this.props
    let selectedType = postTypeChoices.find(t => t.id === type)
    let types = postTypeChoices.filter(t => t.id !== (includeWelcome ? 'all' : 'all+welcome'))
    let selectedSort = sorts.find(s => s.id === sort)

    return <div className='post-list-controls'>
      {false && <input type='text' className='form-control search' placeholder='Filter list by keyword'/>}
      <Dropdown className='type' choices={types} selected={selectedType}
        onChange={t => onChange({type: t.id})}/>
      <Dropdown choices={sorts} selected={selectedSort}
        onChange={s => onChange({sort: s.id})}/>
    </div>
  }
}
