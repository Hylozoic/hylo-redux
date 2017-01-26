import { getPerson } from './person'

export const denormalizedComment = (comment, state) => ({
  ...comment,
  user: getPerson(comment.user_id, state)
})

export const imageUploadSettings = (userId, postId) => ({
  id: postId,
  subject: 'comment-image',
  path: `user/${userId}/post/${postId}`
})
