import { ConversationsStatus } from '~/constants/enum'

export interface GetConversationsReqBody {
  sender_id: string
  receiver_id: string[]
  type: ConversationsStatus
  content: string
}

export interface GetAllConversationsReqBody {
  sender_id: string
}
