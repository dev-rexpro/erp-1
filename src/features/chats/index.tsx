import { Chat } from './components/chat'
import { conversations } from './components/data'

export function Chats() {
  return <Chat conversations={conversations} />
}
