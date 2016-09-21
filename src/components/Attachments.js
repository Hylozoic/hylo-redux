import React from 'react'
import truncHtml from 'trunc-html'
import { filter, isEmpty } from 'lodash/fp'
const { object } = React.PropTypes

const Attachments = (props, { post }) => {
  const attachments = filter(m => m.type === 'gdoc', post.media)
  if (isEmpty(attachments)) return <span/>

  return <div className='post-section'>
    {attachments.map((file, i) =>
      <a key={i} className='attachment' href={file.url} target='_blank' title={file.name}>
        <img src={file.thumbnail_url}/>
        {truncHtml(file.name, 40).text}
      </a>)}
  </div>
}
Attachments.contextTypes = {post: object}

export default Attachments
