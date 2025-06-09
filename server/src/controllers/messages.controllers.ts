import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  SendMessageReqBody,
  EditMessageReqBody,
  GetMessagesReqQuery,
  MarkMessageReadReqBody
} from '~/models/request/Message.requests'
import { TokenPayload } from '~/models/request/User.request'
import messagesServices from '~/services/messages.services'
import { MESSAGES_MESSAGES } from '~/constants/messages'

export const sendMessageController = async (
  req: Request<ParamsDictionary, any, SendMessageReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await messagesServices.sendMessage(user_id, req.body)
  res.json({
    message: MESSAGES_MESSAGES.SEND_MESSAGE_SUCCESS,
    result
  })
}

export const getMessagesController = async (
  req: Request<ParamsDictionary, any, any, GetMessagesReqQuery>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { conversation_id, limit, page, before_message_id } = req.query

  const messages = await messagesServices.getMessages(
    user_id,
    conversation_id as string,
    Number(limit),
    Number(page),
    before_message_id as string
  )

  res.json({
    message: MESSAGES_MESSAGES.GET_MESSAGES_SUCCESS,
    result: messages.messages,
    page: Number(page),
    total_pages: Math.ceil(messages.total / Number(limit)),
    has_more: messages.has_more
  })
}

export const editMessageController = async (
  req: Request<ParamsDictionary, any, EditMessageReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { message_id } = req.params
  const result = await messagesServices.editMessage(user_id, message_id, req.body.content)

  res.json({
    message: MESSAGES_MESSAGES.EDIT_MESSAGE_SUCCESS,
    result
  })
}

export const deleteMessageController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { message_id } = req.params

  await messagesServices.deleteMessage(user_id, message_id)

  res.json({
    message: MESSAGES_MESSAGES.DELETE_MESSAGE_SUCCESS
  })
}

export const markMessageReadController = async (
  req: Request<ParamsDictionary, any, MarkMessageReadReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await messagesServices.markMessagesAsRead(user_id, req.body.conversation_id)

  res.json({
    message: MESSAGES_MESSAGES.MARK_READ_SUCCESS,
    result
  })
}

export const searchMessagesController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { conversation_id, search_term, limit, page } = req.query

  const messages = await messagesServices.searchMessages(
    user_id,
    conversation_id as string,
    search_term as string,
    Number(limit),
    Number(page)
  )

  res.json({
    message: MESSAGES_MESSAGES.SEARCH_MESSAGES_SUCCESS,
    result: messages.messages,
    page: Number(page),
    total_pages: Math.ceil(messages.total / Number(limit))
  })
}
