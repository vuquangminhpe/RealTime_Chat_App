import { LikeTargetType } from '~/models/schemas/like.schema'

export interface LikeReqBody {
  target_id: string
  target_type: LikeTargetType
}

export interface UnlikeReqBody {
  target_id: string
  target_type: LikeTargetType
}

export interface GetLikesReqQuery {
  target_id: string
  target_type: LikeTargetType
  limit?: number
  page?: number
}

export interface CheckLikeStatusReqQuery {
  target_id: string
  target_type: LikeTargetType
}
