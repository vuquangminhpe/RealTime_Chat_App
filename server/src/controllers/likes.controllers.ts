import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { LikeReqBody, UnlikeReqBody } from '~/models/request/Likes.requests'
import { TokenPayload } from '~/models/request/User.request'
import likesServices from '~/services/likes.services'
import { LIKES_MESSAGES } from '~/constants/messages'

export const likeController = async (
  req: Request<ParamsDictionary, any, LikeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await likesServices.like(user_id, req.body)
  res.json({
    message: LIKES_MESSAGES.LIKE_SUCCESS,
    result
  })
}

export const unlikeController = async (
  req: Request<ParamsDictionary, any, UnlikeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { target_id, target_type } = req.body
  await likesServices.unlike(user_id, target_id, target_type)
  res.json({
    message: LIKES_MESSAGES.UNLIKE_SUCCESS
  })
}

export const getLikesController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { target_id, target_type } = req.query
  const { limit, page } = req.query
  const likes = await likesServices.getLikes(target_id as string, target_type as any, Number(limit), Number(page))
  res.json({
    message: LIKES_MESSAGES.GET_LIKES_SUCCESS,
    result: likes.likes,
    page: Number(page),
    total_pages: Math.ceil(likes.total / Number(limit)),
    total_likes: likes.total
  })
}

export const getUserLikesController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { limit, page } = req.query
  const likes = await likesServices.getUserLikes(user_id, Number(limit), Number(page))
  res.json({
    message: LIKES_MESSAGES.GET_USER_LIKES_SUCCESS,
    result: likes.likes,
    page: Number(page),
    total_pages: Math.ceil(likes.total / Number(limit))
  })
}

export const checkLikeStatusController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { target_id, target_type } = req.query
  const isLiked = await likesServices.checkLikeStatus(user_id, target_id as string, target_type as any)
  res.json({
    message: LIKES_MESSAGES.CHECK_LIKE_STATUS_SUCCESS,
    result: { is_liked: isLiked }
  })
}
