import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchProject } from '../../actions'
import { markdown } from '../../util/text'
import { find } from 'lodash'
import truncate from 'html-truncate'
import Avatar from '../../components/Avatar'
import Video from '../../components/Video'
import A from '../../components/A'
const { object } = React.PropTypes

@prefetch(({ dispatch, params: { id } }) => dispatch(fetchProject(id)))
@connect(({ projects, people }, { params: { id } }) => ({
  project: projects[id],
  currentUser: people.current
}))
export default class ProjectProfile extends React.Component {
  static propTypes = {
    project: object,
    children: object,
    currentUser: object
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  publish = event => {
    window.alert('TODO')
  }

  render () {
    let { project, currentUser } = this.props
    if (!project) return <div>Loading...</div>
    let { user, community, media, id, slug } = project
    let video = find(media, m => m.type === 'video')
    let image = find(media, m => m.type === 'image')
    let isPublic = project.visibility === 1
    let isPublished = !!project.published_at
    let canModerate = currentUser && currentUser.id === user.id

    let details = markdown(project.details)
    let expandable
    if (!this.state.expanded) {
      let truncated = truncate(details, 300)
      expandable = truncated.length < details.length
      if (expandable) details = truncated
    }

    return <div id='project'>
      {!isPublished && canModerate && <div className='draft-header'>
        <button onClick={this.publish}>Publish</button>
        <strong>Draft Project</strong> &mdash; You can edit project details, add posts, and invite contributors until you are happy with how your project looks. Only you and other contributors will be able to see this project until it is published.
      </div>}
      <div className='project-header'>
        <div className='col-sm-12 title-row'>
          <div className='right'>
            {canModerate && <A className='button' to={`/project/edit/${project.id}`}>Edit project</A>}
          </div>
          <h2>{project.title}</h2>
        </div>

        <div className='col-sm-8'>
          <h4 className='intention'>Core Intention: {project.intention}</h4>
          {video
            ? <div className='visual'><Video url={video.url}/></div>
          : image && <div className='visual' style={{backgroundImage: `url(${image.url})`}}/>}
          <div dangerouslySetInnerHTML={{__html: details}}/>
          {expandable && <a className='expand' onClick={() => this.setState({expanded: true})}>
            See More
          </a>}
        </div>

        <div className='meta col-sm-4'>
          <ul>
            <li>
              <Avatar person={user}/>
              <div>
                Created by <A to={`/u/${user.id}`}>{user.name}</A>
              </div>
            </li>
            <li>
              <img src={community.avatar_url}/>
              <div>
                Based out of <A to={`/c/${community.slug}`}>{community.name}</A>
              </div>
            </li>
            {isPublic
              ? <li>
                  <span className='icon' style={{backgroundImage: 'url(/img/projects/public.svg)'}}/>
                  <div>
                    <strong>Public Project</strong>
                    {isPublished
                      ? <div>This project is visible to anyone with the link, and anyone may join as a contributor by signing up with Hylo.</div>
                      : <div>When published, this project will be visible to anyone with the link, and anyone will be able to join as a contributor by signing up with Hylo.</div>}
                  </div>
                  <div>
                  </div>
                </li>
              : <li>
                  <span className='icon' style={{backgroundImage: 'url(/img/projects/community.svg)'}}/>
                  <div>
                    <strong>Community Project</strong>
                    {isPublished
                      ? <div>All members of {community.name} may view and join this project.</div>
                      : <div>All members of {community.name} may view and join this project when it is published.</div>}
                  </div>
                </li>}
          </ul>
        </div>
      </div>

      <ul className='tabs'>
        <li>
          <A to={`/project/${id}/${slug}`}>
            <h3>Posts</h3>
            <p>Communicate and share</p>
          </A>
        </li>
        <li>
          <A to={`/project/${id}/${slug}/contributors`}>
            <h3>Contributors</h3>
            <p>See who's involved</p>
          </A>
        </li>
      </ul>

      <div className='tab-content'>
        {this.props.children}
      </div>
    </div>
  }
}
