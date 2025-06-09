import { LikeTargetTypes } from '~/models/schemas/like.schema'

export interface LikeReqBody {
  target_id: string
  target_type: LikeTargetTypes
}

export interface UnlikeReqBody {
  target_id: string
  target_type: LikeTargetTypes
}

export interface GetLikesReqQuery {
  target_id: string
  target_type: LikeTargetTypes
  limit?: number
  page?: number
}

export interface CheckLikeStatusReqQuery {
  target_id: string
  target_type: LikeTargetTypes
}
