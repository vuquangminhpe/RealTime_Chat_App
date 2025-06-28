import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  SendMessageReqBody,
  EditMessageReqBody,
  GetMessagesReqQuery,
  MarkMessageReadReqBody,
  PinMessageReqBody,
  UnpinMessageReqBody,
  AddReactionReqBody,
  ReplyMessageReqBody
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
    result: {
      messages: messages.messages,
      total: messages.total
    },
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
    result: {
      messages: messages.messages,
      total: messages.total
    },
    page: Number(page),
    total_pages: Math.ceil(messages.total / Number(limit))
  })
}

// Pin Message Controllers
export const pinMessageController = async (
  req: Request<ParamsDictionary, any, PinMessageReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await messagesServices.pinMessage(user_id, req.body.message_id)
  res.json(result)
}

export const unpinMessageController = async (
  req: Request<ParamsDictionary, any, UnpinMessageReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await messagesServices.unpinMessage(user_id, req.body.message_id)
  res.json(result)
}

export const getPinnedMessagesController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { conversation_id } = req.query
  const result = await messagesServices.getPinnedMessages(user_id, conversation_id as string)
  res.json({
    message: 'Get pinned messages successfully',
    result
  })
}

// Reaction Controllers
export const addReactionController = async (
  req: Request<ParamsDictionary, any, AddReactionReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await messagesServices.addReaction(user_id, req.body.message_id, req.body.reaction_type)
  res.json(result)
}

export const removeReactionController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { message_id } = req.params
  const result = await messagesServices.removeReaction(user_id, message_id)
  res.json(result)
}

export const getMessageReactionsController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { message_id } = req.params
  const result = await messagesServices.getMessageReactions(user_id, message_id)
  res.json({
    message: 'Get message reactions successfully',
    result
  })
}

// Reply Message Controller
export const replyMessageController = async (
  req: Request<ParamsDictionary, any, ReplyMessageReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  // Reuse sendMessage service with reply_to field
  const sendMessageBody: SendMessageReqBody = {
    conversation_id: req.body.conversation_id,
    content: req.body.content,
    message_type: req.body.message_type,
    medias: req.body.medias,
    reply_to: req.body.reply_to
  }
  const result = await messagesServices.sendMessage(user_id, sendMessageBody)
  res.json({
    message: 'Reply message successfully',
    result
  })
}
