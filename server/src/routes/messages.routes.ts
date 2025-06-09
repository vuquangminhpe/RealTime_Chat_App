import { Router } from 'express'
import {
  sendMessageController,
  getMessagesController,
  editMessageController,
  deleteMessageController,
  markMessageReadController,
  searchMessagesController
} from '~/controllers/messages.controllers'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import {
  sendMessageValidator,
  editMessageValidator,
  deleteMessageValidator,
  getMessagesValidator,
  markMessageReadValidator,
  searchMessagesValidator
} from '~/middlewares/messages.middlewares'
import { paginationValidator } from '~/middlewares/supports.middlewares'
import { wrapAsync } from '~/utils/handler'

export const messagesRouter = Router()

/**
 * Description: Send message
 * Path: /send
 * method: POST
 * headers: {access_token: string}
 * body: SendMessageReqBody
 */
messagesRouter.post(
  '/send',
  accessTokenValidator,
  verifyUserValidator,
  sendMessageValidator,
  wrapAsync(sendMessageController)
)

/**
 * Description: Get messages in conversation
 * Path: /
 * method: GET
 * headers: {access_token: string}
 * query: GetMessagesReqQuery
 */
messagesRouter.get(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  getMessagesValidator,
  wrapAsync(getMessagesController)
)

/**
 * Description: Edit message
 * Path: /:message_id
 * method: PUT
 * headers: {access_token: string}
 * params: {message_id: string}
 * body: EditMessageReqBody
 */
messagesRouter.put(
  '/:message_id',
  accessTokenValidator,
  verifyUserValidator,
  editMessageValidator,
  wrapAsync(editMessageController)
)

/**
 * Description: Delete message
 * Path: /:message_id
 * method: DELETE
 * headers: {access_token: string}
 * params: {message_id: string}
 */
messagesRouter.delete(
  '/:message_id',
  accessTokenValidator,
  verifyUserValidator,
  deleteMessageValidator,
  wrapAsync(deleteMessageController)
)

/**
 * Description: Mark messages as read
 * Path: /mark-read
 * method: POST
 * headers: {access_token: string}
 * body: MarkMessageReadReqBody
 */
messagesRouter.post(
  '/mark-read',
  accessTokenValidator,
  verifyUserValidator,
  markMessageReadValidator,
  wrapAsync(markMessageReadController)
)

/**
 * Description: Search messages
 * Path: /search
 * method: GET
 * headers: {access_token: string}
 * query: SearchMessagesReqQuery
 */
messagesRouter.get(
  '/search',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  searchMessagesValidator,
  wrapAsync(searchMessagesController)
)
