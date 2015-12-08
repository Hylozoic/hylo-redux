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
      <div className='header'>
        <div className='col-sm-12'>
          <h2>{project.title}</h2>
        </div>

        <div className='main col-sm-8'>
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
              <span>
                Created by&nbsp;
                <strong><A to={`/u/${user.id}`}>{user.name}</A></strong>
              </span>
            </li>
            <li>
              <img src={community.avatar_url} className='logo'/>
              <span>
                Based out of <strong><A to={`/c/${community.slug}`}>{community.name}</A></strong>
              </span>
            </li>
          </ul>
        </div>

        <ul className='tabs'>
          <li><A to={`/project/${id}/${slug}`}>Posts</A></li>
          <li><A to={`/project/${id}/${slug}/contributors`}>Contributors</A></li>
        </ul>
      </div>

      <div style={{border: '1px solid red'}}>{this.props.children}</div>
    </div>
  }
}
