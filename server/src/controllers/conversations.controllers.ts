/* eslint-disable @typescript-eslint/no-explicit-any */
import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { GetConversationsReqBody } from '~/models/request/Conversations.requests'
import conversationServices from '~/services/conversation.services'
import { TokenPayload } from '~/models/request/User.request'
import { CONVERSATIONS_MESSAGES } from '~/constants/messages'

export const getConversationsController = async (
  req: Request<ParamsDictionary, any, GetConversationsReqBody>,
  res: Response
) => {
  const { sender_id } = (req as Request).decode_authorization as TokenPayload
  const { receiver_id, type } = req.body
  const { limit, page } = req.query
  const { conversations, total } = await conversationServices.getConversations({
    sender_id,
    receiver_id,
    type,
    page: Number(page),
    limit: Number(limit)
  })
  res.json({
    message: CONVERSATIONS_MESSAGES.GET_CONVERSATION_SUCCESSFULLY,
    result: {
      conversations,
      page: page,
      total_pages: Math.ceil(total / Number(limit))
    }
  })
}

export const getAllConversationsController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { sender_id } = (req as Request).decode_authorization as TokenPayload
  const conversations = await conversationServices.getAllConversations(sender_id)
  res.json({
    message: CONVERSATIONS_MESSAGES.GET_ALL_CONVERSATION_SUCCESSFULLY,
    result: conversations
  })
}
