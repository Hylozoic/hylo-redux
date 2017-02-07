import React from 'react'
import { get } from 'lodash/fp'
import A from '../../components/A'
import PostEditor from '../../components/PostEditor'
import AccessErrorMessage from '../../components/AccessErrorMessage'
import CoverImagePage from '../../components/CoverImagePage'
import EventPost from '../../components/EventPost'
import ProjectPost from '../../components/ProjectPost'
import ProjectActivityCard from '../../components/ProjectActivityCard'
import Post from '../../components/Post'
import { ConnectedPostList } from '../ConnectedPostList'

const { array, bool, object, string, func } = React.PropTypes

export const subject = 'post'

export default class SinglePost extends React.Component {
  static propTypes = {
    post: object,
    parentPost: object,
    community: object,
    editing: bool,
    error: string,
    dispatch: func,
    location: object
  }

  static contextTypes = {
    isMobile: bool,
    currentUser: object
  }

  static childContextTypes = { community: object }

  getChildContext () {
    return { community: this.props.community }
  }

  showPost = (post, parentPost, comments) => {
    if (parentPost) {
      return <ProjectActivityCard {...{post, parentPost}} expanded />
    }
    switch (post.type) {
      case 'event':
        return <EventPost post={post} comments={comments} />
      case 'project':
        return <ProjectPost post={post} comments={comments} />
      default:
        return <Post {...{post, parentPost}} expanded />
    }
  }

  render () {
    const { post, parentPost, comments, community, editing, error, location: { query } } = this.props
    const { currentUser, isMobile } = this.context
    if (error) return <AccessErrorMessage error={error} />
    if (!post || !post.user) return <div className='loading'>Loading...</div>
    const isChild = !!post.parent_post_id

    return <div>
      {isMobile && isChild && <div id='mobile-top-bar'>
        <A className='back' to={`/p/${post.parent_post_id}`}>
          <span className='left-angle-bracket'>&#x3008;</span>
          Back to project
        </A>
      </div>}
      <CoverImagePage id='single-post' image={get('banner_url', community)}>
        {editing
          ? <PostEditor post={post} parentPost={parentPost} expanded />
          : this.showPost(post, parentPost, comments)
        }
        {post.type === 'project' && <div>
          {currentUser &&
            <PostEditor community={community} parentPost={post} />
          }
          <ConnectedPostList
            subject={subject}
            id={post.id}
            parentPost={post}
            query={{...query}}
            noPostsMessage='There are no project related conversations to show.' />
        </div>}
      </CoverImagePage>
    </div>
  }
}
