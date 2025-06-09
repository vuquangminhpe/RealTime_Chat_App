import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { TokenPayload } from '~/models/request/User.request'
import conversationsServices from '~/services/conversation.services'
import { CONVERSATIONS_MESSAGES } from '~/constants/messages'
import {
  CreatePrivateConversationReqBody,
  GetConversationReqQuery,
  MuteConversationReqBody,
  SearchConversationsReqQuery
} from '~/models/request/Conversation.requests'

export const getConversationController = async (
  req: Request<ParamsDictionary, any, any, GetConversationReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { receiver_id, type, limit, page } = req.query

  const result = await conversationsServices.getConversation(
    user_id,
    receiver_id as string[],
    type as string,
    Number(limit),
    Number(page)
  )

  res.json({
    message: CONVERSATIONS_MESSAGES.GET_CONVERSATION_SUCCESSFULLY,
    result: {
      conversations: result.conversations,
      page: Number(page),
      total_pages: Math.ceil(result.total / Number(limit))
    }
  })
}

export const getAllConversationsController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { limit, page } = req.query

  const conversations = await conversationsServices.getAllConversations(user_id, Number(limit), Number(page))

  res.json({
    message: CONVERSATIONS_MESSAGES.GET_ALL_CONVERSATION_SUCCESSFULLY,
    result: conversations.conversations,
    page: Number(page),
    total_pages: Math.ceil(conversations.total / Number(limit))
  })
}

export const createPrivateConversationController = async (
  req: Request<ParamsDictionary, any, CreatePrivateConversationReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { receiver_id } = req.body

  const result = await conversationsServices.createPrivateConversation(user_id, receiver_id)

  res.json({
    message: 'Private conversation created successfully',
    result
  })
}

export const getConversationDetailsController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { conversation_id } = req.params

  const result = await conversationsServices.getConversationDetails(user_id, conversation_id)

  res.json({
    message: 'Get conversation details successfully',
    result
  })
}

export const deleteConversationController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { conversation_id } = req.params

  await conversationsServices.deleteConversation(user_id, conversation_id)

  res.json({
    message: 'Conversation deleted successfully'
  })
}

export const muteConversationController = async (
  req: Request<ParamsDictionary, any, MuteConversationReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { conversation_id } = req.params
  const { mute_until } = req.body

  const result = await conversationsServices.muteConversation(user_id, conversation_id, mute_until)

  res.json({
    message: 'Conversation muted successfully',
    result
  })
}

export const unmuteConversationController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { conversation_id } = req.params

  await conversationsServices.unmuteConversation(user_id, conversation_id)

  res.json({
    message: 'Conversation unmuted successfully'
  })
}

export const pinConversationController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { conversation_id } = req.params

  const result = await conversationsServices.pinConversation(user_id, conversation_id)

  res.json({
    message: 'Conversation pinned successfully',
    result
  })
}

export const unpinConversationController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { conversation_id } = req.params

  await conversationsServices.unpinConversation(user_id, conversation_id)

  res.json({
    message: 'Conversation unpinned successfully'
  })
}

export const searchConversationsController = async (
  req: Request<ParamsDictionary, any, any, SearchConversationsReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { search_term, limit, page } = req.query

  const conversations = await conversationsServices.searchConversations(
    user_id,
    search_term as string,
    Number(limit),
    Number(page)
  )

  res.json({
    message: 'Search conversations successfully',
    result: conversations.conversations,
    page: Number(page),
    total_pages: Math.ceil(conversations.total / Number(limit))
  })
}
