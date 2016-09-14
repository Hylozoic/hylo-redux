import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { connectedListProps, fetchWithCache, refetch } from '../util/caching'
import { makeUrl } from '../util/navigation'
import { navigate, search } from '../actions'
import { debounce, get, isEmpty } from 'lodash'
import Select from '../components/Select'
import Comment from '../components/Comment'
import Avatar from '../components/Avatar'
import A from '../components/A'
import Post from '../components/Post'
import ScrollListener from '../components/ScrollListener'
import CoverImagePage from '../components/CoverImagePage'
import { commentUrl } from '../routes'
import decode from 'ent/decode'
import { denormalizedComment } from '../models/comment'
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
  ...connectedListProps(state, {subject, query}, 'searchResults')
}))
export default class Search extends React.Component {
  static propTypes = {
    dispatch: func,
    location: object,
    searchResults: array,
    total: number,
    pending: bool
  }

  constructor (props) {
    super(props)
    this.state = {textInput: get(props, 'location.query.q')}
  }

  componentWillReceiveProps (nextProps) {
    const newQ = nextProps.location.query.q
    if (this.props.location.query.q !== newQ) {
      this.setState({textInput: newQ})
    }
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
          onChange={t => this.updateSearch({type: t.id})} alignRight/>
      </div>
      <Results results={searchResults}
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

const Results = ({ results, onTagClick, loadMore }) => {
  return <div className='results'>
    {results.map(({ type, data }) => <div key={`${type}${data.id}`}>
      {type === 'post'
        ? <PostResult post={data}/>
        : type === 'person'
          ? <PersonResult person={data} onTagClick={onTagClick}/>
          : <CommentResult comment={data}/>}
    </div>)}
    <ScrollListener onBottom={loadMore}/>
  </div>
}

const PostResult = ({ post }, { dispatch }) =>
  <Post post={post} onExpand={() => dispatch(navigate(`/p/${post.id}`))}/>
PostResult.contextTypes = {dispatch: func}

const PersonResult = ({ person, onTagClick }) => {
  let { bio, tags } = person
  return <div className='person-result'>
    <div className='hello'>
      <Avatar person={person}/>
      <br/>
      <strong><A to={`/u/${person.id}`}>{person.name}</A></strong>
    </div>
    <div className='content'>
      {bio && <p><strong>About me:</strong> {bio}</p>}
      {!isEmpty(tags) && tags.map(tag =>
        <span key={tag}>
          <A className='hashtag' to={makeUrl('/people', {search: '#' + tag})}>
            #{tag}
          </A>
          &nbsp;<wbr/>
        </span>)}
    </div>
  </div>
}

const CommentResult = connect((state, { comment }) => ({
  comment: denormalizedComment(comment, state)
}))(({ comment, dispatch }) => {
  const { post } = comment
  const welcomedPerson = get(post, 'relatedUsers.0')
  const url = commentUrl(comment)
  const visit = () => dispatch(navigate(url))
  return <div className='comment-result'>
    <strong>
      Comment on
      <span> </span>
      <A to={commentUrl(comment)}>
        {post.type === 'welcome'
          ? `${welcomedPerson.name}'s welcome post`
          : `"${decode(post.name)}"`}
      </A>
    </strong>
    <Comment comment={comment} truncate expand={visit}/>
  </div>
})
