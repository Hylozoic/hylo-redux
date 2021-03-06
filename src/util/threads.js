import { countBy } from 'lodash'

export const unseenThreadCount = (threads, last_viewed_messages_at) => {
  const unread = t =>
    threadIsUnnoticed(t, last_viewed_messages_at) && threadIsUnread(t)
  return threads.filter(unread).length
}

export const threadIsUnnoticed = (thread, last_viewed_messages_at) =>
  new Date(last_viewed_messages_at) < new Date(thread.updated_at)

export const threadIsUnread = thread =>
  new Date(thread.last_read_at) < new Date(thread.updated_at)
