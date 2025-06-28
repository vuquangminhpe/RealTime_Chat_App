import { Media } from '~/models/Other'
import { MessageTypes } from '../schemas/message.chema'

export interface SendMessageReqBody {
  conversation_id: string
  content: string
  message_type?: MessageTypes
  medias?: Media[]
  reply_to?: string
}

export interface EditMessageReqBody {
  content: string
}

export interface GetMessagesReqQuery {
  conversation_id: string
  limit?: number
  page?: number
  before_message_id?: string // For pagination
}

export interface MarkMessageReadReqBody {
  conversation_id: string
}

export interface SearchMessagesReqQuery {
  conversation_id: string
  search_term: string
  limit?: number
  page?: number
}

export interface PinMessageReqBody {
  message_id: string
}

export interface UnpinMessageReqBody {
  message_id: string
}

export interface AddReactionReqBody {
  message_id: string
  reaction_type: number // ReactionStatus enum value
}

export interface ReplyMessageReqBody {
  conversation_id: string
  content: string
  message_type?: MessageTypes
  medias?: Media[]
  reply_to: string // ID của tin nhắn được reply
}
