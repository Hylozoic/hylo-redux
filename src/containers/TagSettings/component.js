/* eslint-disable camelcase */
import React from 'react'
import A from '../../components/A'
import Icon from '../../components/Icon'
import ScrollListener from '../../components/ScrollListener'
import { onEnter } from '../../util/textInput'
import { includes } from 'lodash'
import { map, find } from 'lodash/fp'
const { object, bool, array, func, number, string, shape } = React.PropTypes
const subject = 'community'

export default class TagSettings extends React.Component {
  static propTypes = {
    tags: array.isRequired,
    community: object.isRequired,
    pending: bool,
    total: number.isRequired,
    showModal: func.isRequired,
    fetchTags: func.isRequired,
    removeTagFromCommunity: func.isRequired,
    updateCommunityTag: func.isRequired
  }

  createTag () {
    this.props.showModal('tag-editor', {
      creating: true
    })
  }

  render () {
    const {
      tags, community, pending, total, fetchTags, removeTagFromCommunity, updateCommunityTag
    } = this.props
    const findMembership = tag =>
      find(m => m.community_id === community.id, tag.memberships)
    const communityTags = map(tag => ({...tag, ...findMembership(tag)}), tags)
    const { slug } = community
    const offset = tags.length
    const loadMore = !pending && offset < total
      ? () => fetchTags({subject, id: slug, offset})
      : () => {}
    const remove = tag =>
      window.confirm('Are you sure? This cannot be undone.') &&
        removeTagFromCommunity(tag, slug)
    const canDelete = tag => !includes(['request', 'offer', 'intention'], tag.name)

    const update = (tag, params) =>
      updateCommunityTag(tag, community, params)

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
          update={update} />
      )}
      <div className='add-button-row' />
      <ScrollListener onBottom={loadMore} />
    </div>
  }
}

export class TopicRow extends React.Component {
  static propTypes = {
    tag: shape({
      id: string.isRequired,
      name: string.isRequired,
      description: string.isRequired
    }).isRequired,
    slug: string.isRequired,
    remove: func.isRequired,
    update: func.isRequired,
    canDelete: func.isRequired
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevState.editing !== this.state.editing && this.refs.description) {
      this.refs.description.focus()
    }
  }

  render () {
    const { tag, slug, remove, update, canDelete } = this.props

    const { editing, description } = this.state

    const edit = tag => {
      this.setState({editing: true})
      this.setState({description: tag.description})
    }

    const cancelEdit = () =>
      setTimeout(() => this.setState({editing: null}), 100)

    const setDescription = event => this.setState({description: event.target.value})

    const updateDefault = (tag, is_default) =>
      update(tag, {is_default})

    const updateDescription = tag => {
      update(tag, {description})
      cancelEdit()
    }

    return <div className='topic-row'>
      <div className='icon-row'>
        <span className='name'>{tag.name}</span>
        {tag.post_type && <span className='topic-post-type'>
          {tag.post_type}
        </span>}
        <span className='icon-column'>
          {editing
            ? <span className='disabled'><Icon name='Pencil' /></span>
            : <a className='edit-link' onClick={() => edit(tag)}>
              <Icon name='Pencil' />
            </a>}
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
        {editing
          ? <div className='edit-description'>
            <input ref='description'
              type='text'
              value={description || ''}
              onChange={setDescription}
              onBlur={cancelEdit}
              onKeyDown={onEnter(() => updateDescription(tag))} />
            <a className='cross'><Icon name='Cross' /></a>
            <a className='check' onClick={() => updateDescription(tag)}><Icon name='Tick' /></a>
          </div>
          : tag.description}
      </div>
    </div>
  }
}
