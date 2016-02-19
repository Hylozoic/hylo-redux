import React from 'react'
import { compose } from 'redux'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { connectedListProps, fetchWithCache, refetch } from '../util/caching'
import { navigate, search } from '../actions'
import { debounce } from 'lodash'
import Select from '../components/Select'
import Comment from '../components/Comment'
import Avatar from '../components/Avatar'
import A from '../components/A'
import Post from '../components/Post'
import ScrollListener from '../components/ScrollListener'

const types = [
  {name: 'Everything'},
  {name: 'Posts', id: 'post'},
  {name: 'People', id: 'person'},
  {name: 'Comments', id: 'comment'}
]

const subject = 'search'
const fetch = fetchWithCache(search)

const Search = compose(
  prefetch(({ dispatch, query }) => query.q && dispatch(fetch(subject, null, query))),
  connect((state, { location: { query } }) => ({
    ...connectedListProps(state, {subject, query}, 'searchResults')
  }))
)(({ dispatch, location, searchResults, total, pending }) => {
  let updateSearch = debounce(opts => dispatch(refetch(opts, location)), 500)
  let { q, type } = location.query
  let selectedType = types.find(t => t.id === type) || types[0]

  let loadMore = () => {
    let offset = searchResults.length
    if (!pending && offset < total) {
      dispatch(fetch(subject, null, {q, type, offset}))
    }
  }

  return <div id='search'>
    <h2>Search!</h2>
    <div className='list-controls'>
      <input type='text' className='form-control search' defaultValue={q}
        onChange={event => updateSearch({q: event.target.value})}/>
      <Select className='type' choices={types} selected={selectedType}
        onChange={t => updateSearch({type: t.id})} alignRight={true}/>
    </div>
    <div className='results'>
      {searchResults.map(({ type, data }) => <div key={`${type}${data.id}`}>
        {type === 'post'
          ? <PostResult post={data} dispatch={dispatch}/>
          : type === 'person'
            ? <PersonResult person={data}/>
          : <CommentResult comment={data}/>}
      </div>)}
    </div>
    <ScrollListener onBottom={loadMore}/>
  </div>
})

export default Search

const PostResult = ({ post, dispatch }) => {
  post.communities = []
  return <Post post={post} onExpand={() => dispatch(navigate(`/p/${post.id}`))}/>
}

const PersonResult = ({ person }) => {
  return <div className='person-result'>
    <Avatar person={person}/>
    <strong><A to={`/u/{person.id}`}>{person.name}</A></strong>
  </div>
}

const CommentResult = ({ comment }) => {
  let { post } = comment
  return <div className='comment-result'>
    <strong>
      Comment on
      <A to={`/p/${post.id}`}>"{post.name}"</A>
    </strong>
    <Comment comment={comment}/>
  </div>
}
