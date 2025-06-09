import { ReactionStatus } from '~/constants/enum'

export interface AddReactionReqBody {
  target_id: string
  target_type: 'story' | 'message' | 'comment'
  reaction_type: ReactionStatus
}

export interface RemoveReactionReqBody {
  target_id: string
  target_type: 'story' | 'message' | 'comment'
}

export interface GetReactionsReqQuery {
  target_id: string
  target_type: 'story' | 'message' | 'comment'
  limit?: number
  page?: number
}
