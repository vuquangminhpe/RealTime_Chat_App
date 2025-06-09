import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { AddReactionReqBody, RemoveReactionReqBody } from '~/models/request/Reactions.requests'
import { TokenPayload } from '~/models/request/User.request'
import reactionsServices from '~/services/reactions.services'
import { REACTIONS_MESSAGES } from '~/constants/messages'

export const addReactionController = async (
  req: Request<ParamsDictionary, any, AddReactionReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await reactionsServices.addReaction(user_id, req.body)
  res.json({
    message: REACTIONS_MESSAGES.ADD_REACTION_SUCCESS,
    result
  })
}

export const removeReactionController = async (
  req: Request<ParamsDictionary, any, RemoveReactionReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { target_id, target_type } = req.body
  await reactionsServices.removeReaction(user_id, target_id, target_type)
  res.json({
    message: REACTIONS_MESSAGES.REMOVE_REACTION_SUCCESS
  })
}

export const getReactionsController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { target_id, target_type } = req.query
  const { limit, page } = req.query
  const reactions = await reactionsServices.getReactions(
    target_id as string,
    target_type as string,
    Number(limit),
    Number(page)
  )
  res.json({
    message: REACTIONS_MESSAGES.GET_REACTIONS_SUCCESS,
    result: reactions.reactions,
    page: Number(page),
    total_pages: Math.ceil(reactions.total / Number(limit)),
    reaction_summary: reactions.summary
  })
}

export const getUserReactionsController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { limit, page } = req.query
  const reactions = await reactionsServices.getUserReactions(user_id, Number(limit), Number(page))
  res.json({
    message: REACTIONS_MESSAGES.GET_USER_REACTIONS_SUCCESS,
    result: reactions.reactions,
    page: Number(page),
    total_pages: Math.ceil(reactions.total / Number(limit))
  })
}
