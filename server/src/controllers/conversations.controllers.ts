/* eslint-disable @typescript-eslint/no-explicit-any */
import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { GetConversationsReqBody } from '~/models/request/Conversations.requests'

export const getConversationsController = async (
  req: Request<ParamsDictionary, any, GetConversationsReqBody>,
  res: Response
) => {
  const { sender_id, receiver_id, type } = req.body
  const { conversation, total } = await conversationServices.getConversations(sender_id, receiver_id, type)
}
