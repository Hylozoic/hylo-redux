import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchProject } from '../../actions'
import { markdown } from '../../util/text'
import truncate from 'html-truncate'
import Avatar from '../../components/Avatar'
import Video from '../../components/Video'
import A from '../../components/A'
const { object } = React.PropTypes

@prefetch(({ dispatch, params: { id } }) => dispatch(fetchProject(id)))
@connect(({ projects }, { params: { id } }) => ({project: projects[id]}))
export default class ProjectProfile extends React.Component {
  static propTypes = {
    project: object,
    children: object
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    let { project } = this.props
    if (!project) return <div>Loading...</div>
    let { user, community, image_url, video_url, id, slug } = project

    let details = markdown(project.details)
    let expandable
    if (!this.state.expanded) {
      let truncated = truncate(details, 300)
      expandable = truncated.length < details.length
      if (expandable) details = truncated
    }

    return <div id='project'>
      <div className='project-header'>
        <div className='col-sm-12'>
          <h2>{project.title}</h2>
        </div>

        <div className='col-sm-8'>
          <h4 className='intention'>Core Intention: {project.intention}</h4>
          {video_url
            ? <div className='visual'><Video url={video_url}/></div>
            : image_url && <div className='visual' style={{backgroundImage: `url(${image_url})`}}/>}
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
              <img src={community.avatar_url} className='logo'/>
              <div>
                Based out of <A to={`/c/${community.slug}`}>{community.name}</A>
              </div>
            </li>
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
