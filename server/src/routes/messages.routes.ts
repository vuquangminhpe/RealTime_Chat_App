import { Router } from 'express'
import {
  sendMessageController,
  getMessagesController,
  editMessageController,
  deleteMessageController,
  markMessageReadController,
  searchMessagesController,
  pinMessageController,
  unpinMessageController,
  getPinnedMessagesController,
  addReactionController,
  removeReactionController,
  getMessageReactionsController,
  replyMessageController
} from '~/controllers/messages.controllers'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import {
  sendMessageValidator,
  editMessageValidator,
  deleteMessageValidator,
  getMessagesValidator,
  markMessageReadValidator,
  searchMessagesValidator,
  pinMessageValidator,
  unpinMessageValidator,
  addReactionValidator,
  replyMessageValidator
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

/**
 * Description: Pin message
 * Path: /pin
 * method: POST
 * headers: {access_token: string}
 * body: {message_id: string}
 */
messagesRouter.post(
  '/pin',
  accessTokenValidator,
  verifyUserValidator,
  pinMessageValidator,
  wrapAsync(pinMessageController)
)

/**
 * Description: Unpin message
 * Path: /unpin
 * method: POST
 * headers: {access_token: string}
 * body: {message_id: string}
 */
messagesRouter.post(
  '/unpin',
  accessTokenValidator,
  verifyUserValidator,
  unpinMessageValidator,
  wrapAsync(unpinMessageController)
)

/**
 * Description: Get pinned messages in conversation
 * Path: /pinned
 * method: GET
 * headers: {access_token: string}
 * query: {conversation_id: string}
 */
messagesRouter.get(
  '/pinned',
  accessTokenValidator,
  verifyUserValidator,
  wrapAsync(getPinnedMessagesController)
)

/**
 * Description: Add reaction to message
 * Path: /reaction
 * method: POST
 * headers: {access_token: string}
 * body: {message_id: string, reaction_type: number}
 */
messagesRouter.post(
  '/reaction',
  accessTokenValidator,
  verifyUserValidator,
  addReactionValidator,
  wrapAsync(addReactionController)
)

/**
 * Description: Remove reaction from message
 * Path: /reaction/:message_id
 * method: DELETE
 * headers: {access_token: string}
 * params: {message_id: string}
 */
messagesRouter.delete(
  '/reaction/:message_id',
  accessTokenValidator,
  verifyUserValidator,
  wrapAsync(removeReactionController)
)

/**
 * Description: Get message reactions
 * Path: /:message_id/reactions
 * method: GET
 * headers: {access_token: string}
 * params: {message_id: string}
 */
messagesRouter.get(
  '/:message_id/reactions',
  accessTokenValidator,
  verifyUserValidator,
  wrapAsync(getMessageReactionsController)
)

/**
 * Description: Reply to message
 * Path: /reply
 * method: POST
 * headers: {access_token: string}
 * body: {conversation_id: string, content: string, reply_to: string, message_type?: string, medias?: Media[]}
 */
messagesRouter.post(
  '/reply',
  accessTokenValidator,
  verifyUserValidator,
  replyMessageValidator,
  wrapAsync(replyMessageController)
)
