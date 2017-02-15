import React, { PropTypes } from 'react'
import { get } from 'lodash/fp'
import truncateHtml from 'trunc-html'
import { sanitize } from 'hylo-utils/text'
import { humanDate, prependInP, present, textLength } from '../../util/text'
import { commentUrl } from '../../routes'
import { canEditComment } from '../../models/currentUser'
import ClickCatcher from '../ClickCatcher'
import CommentForm from '../CommentForm'
import Dropdown from '../Dropdown'
import Avatar from '../Avatar'
import A from '../A'
import Icon from '../Icon'
import ImageWithFallback from '../ImageWithFallback'
import { some } from 'lodash'

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
const TRUNCATED_LENGTH = 200

export default class Comment extends React.Component {
  static propTypes = {
    comment: PropTypes.object.isRequired,
    community: PropTypes.object,
    truncate: PropTypes.bool,
    expand: PropTypes.func,
    removeComment: PropTypes.func,
    thank: PropTypes.func,
    updateCommentEditor: PropTypes.func,
    showImage: PropTypes.func
  }

  static contextTypes = {
    currentUser: PropTypes.object,
    isMobile: PropTypes.bool,
    location: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const {
      comment,
      community,
      truncate,
      expand,
      removeComment,
      thank,
      updateCommentEditor,
      showImage
    } = this.props
    const { currentUser, isMobile, location } = this.context
    const { editing } = this.state

    const person = comment.user
    const notPending = comment.id.slice(0,4) === 'post' ? null : true
    const { thank_ids, image } = comment
    const isThanked = some(thank_ids, id => id === get('id', currentUser))

    let text = present(sanitize(comment.text), {slug: get('slug', community)})
    const truncated = truncate && textLength(text) > TRUNCATED_LENGTH
    if (truncated) text = truncateHtml(text, TRUNCATED_LENGTH).html
    const name = sanitize(person.name).replace(/ /g, '&nbsp;')
    text = prependInP(text, `<a href='/u/${person.id}' data-user-id='${person.id}' class='name'>${name}</a>`)

    const remove = () => window.confirm('Delete this comment? This cannot be undone.') &&
      removeComment(comment.id, comment.post_id)
    const edit = () => {
      this.setState({editing: true})
      return updateCommentEditor(comment.id, comment.text, false)
    }
    const closeEdit = () => {
      this.setState({editing: false})
    }

    if (editing) return <CommentForm commentId={comment.id} close={closeEdit} />

    return <div className='comment' data-comment-id={comment.id}>
      {notPending && canEditComment(currentUser, comment, community) &&
        <Dropdown alignRight toggleChildren={<Icon name='More' />}>
          {!image && <li><a onClick={edit}>Edit</a></li>}
          <li><a onClick={remove}>Remove</a></li>
        </Dropdown>}
      {notPending && <a name={`comment-${comment.id}`} />}
      <Avatar person={person} showPopover />
      <div className='content'>
        {image && <div className='text'>
          <A to={`/u/${person.id}`} className='name'>{person.name}</A>
        </div>}
        {image && <a onClick={() => showImage(image.url, location.pathname, isMobile)}>
          <ImageWithFallback useClass='thumbnail' preferredSrc={image.thumbnail_url} fallbackSrc={image.url} />
        </a>}
        {!image && <ClickCatcher className='text' dangerouslySetInnerHTML={{__html: text}} />}
        {!image && truncated && <span> <a onClick={expand} className='show-more'>Show&nbsp;more</a></span>}
        <div>
          {notPending && currentUser && <span>
            {currentUser.id !== person.id &&
              <a className='thanks' onClick={() => thank(comment.id, currentUser)}>
                {isThanked ? `You thanked ${person.name.split(' ')[0]}` : 'Say thanks'}
              </a>}
            {currentUser.id !== person.id && spacer}
          </span>}
          <A className='date' to={commentUrl(comment)}>{notPending ? humanDate(comment.created_at) : 'sending...'}</A>
        </div>
      </div>
    </div>
  }
}
