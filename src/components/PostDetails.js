/* eslint-disable camelcase */
import React, { PropTypes } from 'react'
import { difference } from 'lodash'
import { filter, get } from 'lodash/fp'
import cheerio from 'cheerio'
import { sanitize } from 'hylo-utils/text'
import { tagUrl } from '../routes'
import { present, textLength, truncate, appendInP } from '../util/text'
import ClickCatcher from './ClickCatcher'

export default function PostDetails ({ post, community, expanded, onExpand, onMouseOver }) {
  const truncatedSize = 300
  const { tag } = post
  const slug = get('slug', community)
  let description = presentDescription(post, community)
  let extractedTags = []
  const truncated = !expanded && textLength(description) > truncatedSize
  if (truncated) {
    const orig = description
    description = truncate(description, truncatedSize)
    extractedTags = extractTags(description, orig, tag)
  }
  if (description) description = appendInP(description, '&nbsp;')

  return <div className='post-section details'>
    <ClickCatcher dangerouslySetInnerHTML={{__html: description}} />
    {truncated && <span>
      <wbr />
      <a onClick={() => onExpand(null)} className='show-more'>Show&nbsp;more</a>
      &nbsp;
    </span>}
    {extractedTags.map(tag => <span key={tag}>
      <wbr />
      <HashtagLink tag={tag} slug={slug} onMouseOver={onMouseOver} />
      &nbsp;
    </span>)}
    {tag && <HashtagLink tag={tag} slug={slug} />}
  </div>
}
PostDetails.propTypes = {
  post: PropTypes.object.isRequired,
  community: PropTypes.object.isRequired,
  expanded: PropTypes.bool,
  onExpand: PropTypes.func,
  onMouseOver: PropTypes.func
}

export function presentDescription (post, community, opts = {}) {
  return present(sanitize(post.description), {slug: get('slug', community), ...opts})
}

function HashtagLink ({ tag, slug, onMouseOver }) {
  return <a className='hashtag' href={tagUrl(tag, slug)} {...{onMouseOver}}>
    {`#${tag}`}
  </a>
}

function extractTags (shortDesc, fullDesc, omitTag) {
  const tags = filter(t => t !== omitTag, getTags(fullDesc))
  return tags.length === 0 ? [] : difference(tags, getTags(shortDesc))
}

function getTags (text) {
  return cheerio.load(text)('.hashtag').toArray().map(tag =>
    tag.children[0].data.replace(/^#/, ''))
}
