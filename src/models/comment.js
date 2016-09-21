import { getPerson } from './person'

export const denormalizedComment = (comment, state) => ({
  ...comment,
  user: getPerson(comment.user_id, state)
})
