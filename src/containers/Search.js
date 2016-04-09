import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { connectedListProps, fetchWithCache, refetch } from '../util/caching'
import { navigate, search } from '../actions'
import { debounce, get, isEmpty, pick, some } from 'lodash'
import Select from '../components/Select'
import Comment from '../components/Comment'
import Avatar from '../components/Avatar'
import A from '../components/A'
import Post from '../components/Post'
import ScrollListener from '../components/ScrollListener'
import Tags from '../components/Tags'
import CoverImagePage from '../components/CoverImagePage'
import { commentUrl } from '../routes'
const { array, bool, func, number, object } = React.PropTypes

const types = [
  {name: 'Everything'},
  {name: 'Posts', id: 'post'},
  {name: 'People', id: 'person'},
  {name: 'Comments', id: 'comment'}
]

const subject = 'search'
const fetch = fetchWithCache(search)

@prefetch(({ dispatch, query }) => query.q && dispatch(fetch(subject, null, query)))
@connect((state, { location: { query } }) => ({
  ...connectedListProps(state, {subject, query}, 'searchResults'),
  currentUser: state.people.current
}))
export default class Search extends React.Component {
  static propTypes = {
    dispatch: func,
    location: object,
    searchResults: array,
    total: number,
    pending: bool
  }

  static childContextTypes = {
    dispatch: func,
    currentUser: object
  }

  constructor (props) {
    super(props)
    this.state = {textInput: get(props, 'location.query.q')}
  }

  getChildContext () {
    return pick(this.props, 'currentUser', 'dispatch')
  }

  updateSearch = debounce(opts => {
    let { dispatch, location } = this.props
    return dispatch(refetch(opts, location))
  }, 500)

  render () {
    let { dispatch, location, searchResults, total, pending } = this.props
    if (pending && !searchResults) {
      return <div>Loading...</div>
    }

    let { q, type } = location.query
    let selectedType = types.find(t => t.id === type) || types[0]

    let loadMore = () => {
      let offset = searchResults.length
      if (!pending && offset < total) {
        dispatch(fetch(subject, null, {q, type, offset}))
      }
    }

    let updateTextInput = text => {
      this.setState({textInput: text})
      this.updateSearch({q: text})
    }

    return <CoverImagePage id='search'>
      <div className='list-controls'>
        <input type='text' className='form-control search'
          value={this.state.textInput}
          onChange={event => updateTextInput(event.target.value)}/>
        <Select className='type' choices={types} selected={selectedType}
          onChange={t => this.updateSearch({type: t.id})} alignRight={true}/>
      </div>
      <Results results={searchResults}
        dispatch={dispatch}
        onTagClick={tag => updateTextInput(tag)}
        loadMore={loadMore}/>
      {pending
        ? <div className='message'>Loading...</div>
        : isEmpty(searchResults) && (q
          ? <div className='message'>No results match your search term.</div>
        : <div className='message'>Type a search term to search posts, comments, and people.</div>)}
    </CoverImagePage>
  }
}

const Results = ({ results, dispatch, onTagClick, loadMore }) => {
  return <div className='results'>
    {results.map(({ type, data }) => <div key={`${type}${data.id}`}>
      {type === 'post'
        ? <PostResult post={data} dispatch={dispatch}/>
        : type === 'person'
          ? <PersonResult person={data} onTagClick={onTagClick}/>
        : <CommentResult comment={data} dispatch={dispatch}/>}
    </div>)}
    <ScrollListener onBottom={loadMore}/>
  </div>
}

const PostResult = ({ post, dispatch }) => {
  return <Post post={post}/>
}

const PersonResult = ({ person, onTagClick }) => {
  let { bio, work, intention, skills, organizations } = person
  return <div className='person-result'>
    <div className='hello'>
      <Avatar person={person}/>
      <br/>
      <strong><A to={`/u/${person.id}`}>{person.name}</A></strong>
    </div>
    <div className='content'>
      {bio && <p><strong>About me:</strong> {bio}</p>}
      {work && <p><strong>What I'm doing:</strong> {work}</p>}
      {intention && <p><strong>What I'd like to do:</strong> {intention}</p>}
      {some(skills) && <div className='tag-group skills'>
        <strong>Skills:</strong>
        <Tags onClick={onTagClick}>{skills}</Tags>
      </div>}
      {some(organizations) && <div className='tag-group'>
        <strong>Groups:</strong>
        <Tags onClick={onTagClick}>{organizations}</Tags>
      </div>}
    </div>
  </div>
}

const CommentResult = ({ comment, dispatch }) => {
  const { post } = comment
  const welcomedPerson = get(post, 'relatedUsers.0')
  const url = commentUrl(comment)
  const visit = () => dispatch(navigate(url))
  return <div className='comment-result'>
    <strong>
      Comment on
      <span> </span>
      <A to={commentUrl(comment)}>
        {post.tag === 'welcome'
          ? `${welcomedPerson.name}'s welcome post`
          : `"${post.name}"`}
      </A>
    </strong>
    <Comment comment={comment} truncate={true} expand={visit}/>
  </div>
}
