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
