import React from 'react'
import { connect } from 'react-redux'
import { markdown } from '../../util/text'
import Tags from '../../components/Tags'

const LinkButton = ({ href, icon }) =>
  <a className='button' href={href} target='_blank'><i className={`icon-${icon}`}></i></a>

const Section = ({ title, children }) =>
  <section>
    <h4>{title}</h4>
    {children}
  </section>

const AboutPerson = connect(
  (state, { params }) => ({person: state.people[params.id]})
)(({ person }) => {
  let { facebook_url, twitter_name, linkedin_url } = person
  let hasSocialMedia = !!(facebook_url || twitter_name || linkedin_url)

  return <div className='about'>
    <Section title='About me'>
      <p>{person.bio}</p>
      {hasSocialMedia && <div className='social-media'>
        {facebook_url && <LinkButton href={facebook_url} icon='facebook'/>}
        {twitter_name && <LinkButton href={`https://twitter.com/${twitter_name}`} icon='twitter'/>}
        {linkedin_url && <LinkButton href={linkedin_url} icon='linkedin'/>}
      </div>}
    </Section>
    <Section title='What I am doing'>
      <p>{person.work}</p>
    </Section>
    <Section title='What I would like to do'>
      <p>{person.intention}</p>
    </Section>
    <Section title='Skills'>
      <Tags>{person.skills}</Tags>
    </Section>
    <Section title='Affiliations'>
      <Tags>{person.organizations}</Tags>
    </Section>
    {person.extra_info && <Section title='Other information'>
      <div dangerouslySetInnerHTML={{__html: markdown(person.extra_info || '')}}></div>
    </Section>}
  </div>
})

export default AboutPerson
