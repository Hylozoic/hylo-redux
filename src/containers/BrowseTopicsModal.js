import React from 'react'
import { connect } from 'react-redux'
import { getCurrentCommunity } from '../models/community'
import { connectedListProps } from '../util/caching'
import { fetchTags } from '../actions/tags'
import ScrollListener from '../components/ScrollListener'
import { modalWrapperCSSId, Modal } from '../components/Modal'
import { isEmpty } from 'lodash'
import { humanDate } from '../util/text'
const { array, bool, func, number, object } = React.PropTypes

const subject = 'community'

@connect(state => {
  const community = getCurrentCommunity(state)
  return {
    community,
    ...connectedListProps(state, {subject, id: community.slug}, 'tags')
  }
})
export default class BrowseTopicsModal extends React.Component {
  static propTypes = {
    dispatch: func,
    tags: array,
    community: object,
    pending: bool,
    total: number
  }

  componentDidMount () {
    const { dispatch, community } = this.props
    dispatch(fetchTags({subject, id: community.slug}))
  }

  render () {
    const { tags, community, dispatch, pending, total } = this.props
    const offset = tags.length
    const loadMore = !pending && offset < total
      ? () => dispatch(fetchTags({subject, id: community.slug, offset}))
      : () => {}

    const title = total
      ? `Browse all ${total} topics`
      : 'Browse all topics'

    return <Modal title={title} id='browse-all-topics'>
      {isEmpty(tags) ? <div className='loading'>Loading...</div>
        : <ul>
            {tags.map(({ id, name, description, owner, created_at }) =>
              <li key={id}>
                <span className='name'>#{name}</span>
                {description && <span className='description'>
                  {description}
                </span>}
                {!isEmpty(owner) && <span className='meta'>
                  created by {owner.name} {humanDate(created_at)}
                </span>}
              </li>)}
          </ul>}
      <ScrollListener elementId={modalWrapperCSSId}
        onBottom={loadMore}/>
    </Modal>
  }
}
