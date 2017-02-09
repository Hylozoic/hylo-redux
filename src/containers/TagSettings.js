/* eslint-disable camelcase */
import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import {
  fetchTags, removeTagFromCommunity, updateCommunityTag, showModal
} from '../actions'
import { getCurrentCommunity } from '../models/community'
import A from '../components/A'
import Icon from '../components/Icon'
import ScrollListener from '../components/ScrollListener'
import { connectedListProps } from '../util/caching'
import { includes } from 'lodash'
import { map, find } from 'lodash/fp'
const { object, bool, array, func, number, string } = React.PropTypes
const subject = 'community'

@prefetch(({ params: { id }, dispatch }) =>
  dispatch(fetchTags({subject, id})))
@connect((state, { params: { id }, location: { query } }) => {
  return ({
    ...connectedListProps(state, {subject, id, query}, 'tags'),
    community: getCurrentCommunity(state)
  })
})
export default class TagSettings extends React.Component {

  static propTypes = {
    dispatch: func,
    tags: array,
    community: object,
    location: object,
    pending: bool,
    total: number
  }

  createTag () {
    this.props.dispatch(showModal('tag-editor', {
      creating: true
    }))
  }

  render () {
    const { tags, community, dispatch, pending, total } = this.props
    const findMembership = tag =>
      find(m => m.community_id === community.id, tag.memberships)
    const communityTags = map(tag => ({...tag, ...findMembership(tag)}), tags)
    const { slug } = community
    const offset = tags.length
    const loadMore = !pending && offset < total
      ? () => dispatch(fetchTags({subject, id: slug, offset}))
      : () => {}
    const remove = tag =>
      window.confirm('Are you sure? This cannot be undone.') &&
        dispatch(removeTagFromCommunity(tag, slug))
    const canDelete = tag => !includes(['request', 'offer', 'intention'], tag.name)

    const updateDefault = (tag, is_default) => {
      dispatch(updateCommunityTag(tag, community, {is_default}))
    }

    return <div id='topic-settings'>
      <h2>Manage Topics</h2>
      <p className='meta'>
        When a topic is  set as default, it shows up in the topic dropdown menu for new posts,
        and all new members start out following that topic.
        Removing a topic from this community prevents it from appearing in lists,
        but does not change or erase any posts or comments.
      </p>
      <a className='button' onClick={() => this.createTag()}>Add Topic</a>
      <div className='header-row'>default</div>
      {communityTags.map(tag =>
        <TopicRow key={tag.id}
          tag={tag}
          slug={slug}
          remove={remove}
          canDelete={canDelete}
          updateDefault={updateDefault} />
      )}
      <div className='add-button-row' />
      <ScrollListener onBottom={loadMore} />
    </div>
  }
}

class TopicRow extends React.Component {
  static propTypes = {
    tag: object,
    slug: string,
    remove: func,
    updateDefault: func,
    canDelete: func
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { tag, slug, remove, updateDefault, canDelete } = this.props

    const { editing } = this.state

    const edit = id => this.setState({editing: id})

    return <div className='topic-row'>
      <div className='icon-row'>
        <span className='name'>{tag.name}</span>
        {tag.post_type && <span className='topic-post-type'>
          {tag.post_type}
        </span>}
        <span className='icon-column'>
          <a onClick={() => edit(tag.id)}>
            <Icon name='Pencil' />
          </a>
        </span>
        <span className='icon-column'>
          <A to={`/c/${slug}/tag/${tag.name}`}>
            <Icon name='View' />
          </A>
        </span>
        <span className='icon-column'>
          {canDelete(tag) && <a onClick={() => remove(tag)}>
            <Icon name='Trash' />
          </a>}
        </span>
        <span className='icon-column'>
          <input type='checkbox'
            defaultChecked={tag.is_default}
            onChange={() => updateDefault(tag, !tag.is_default)} />
        </span>
      </div>
      <div className='description-row'>
        {editing === tag.id
          ? <input type='text' />
          : tag.description}
      </div>
    </div>
  }
}
