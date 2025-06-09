export interface GetConversationReqQuery {
  receiver_id: string | string[]
  type: 'private' | 'group'
  limit?: number
  page?: number
}

export interface CreatePrivateConversationReqBody {
  receiver_id: string
}

export interface MuteConversationReqBody {
  mute_until?: Date
}

export interface SearchConversationsReqQuery {
  search_term: string
  limit?: number
  page?: number
}

export interface GetAllConversationsReqQuery {
  limit?: number
  page?: number
  type?: 'private' | 'group'
  status?: 'active' | 'archived' | 'muted'
}
