import React from 'react'

export const personTemplate = person => {
  return <a data-user-id={person.id} href={'/u/' + person.id}>{person.name}</a>
}
