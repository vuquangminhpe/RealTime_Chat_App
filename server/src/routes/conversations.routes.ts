import { Router } from 'express'
import {
  getConversationController,
  getAllConversationsController,
  createPrivateConversationController,
  deleteConversationController,
  muteConversationController,
  unmuteConversationController,
  pinConversationController,
  unpinConversationController,
  getConversationDetailsController,
  searchConversationsController
} from '~/controllers/conversations.controllers'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import {
  getConversationValidator,
  createPrivateConversationValidator,
  deleteConversationValidator,
  muteConversationValidator,
  pinConversationValidator,
  searchConversationsValidator
} from '~/middlewares/conversation.middlewares'
import { paginationValidator } from '~/middlewares/supports.middlewares'
import { wrapAsync } from '~/utils/handler'

const conversationsRouter = Router()

/**
 * Description: Get conversation with specific users
 * Path: /receivers
 * method: GET
 * headers: {access_token: string}
 * query: {receiver_id: string[], type: 'private' | 'group', limit: number, page: number}
 */
conversationsRouter.get(
  '/receivers',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  getConversationValidator,
  wrapAsync(getConversationController)
)

/**
 * Description: Get all conversations for user
 * Path: /get_all_conversations
 * method: GET
 * headers: {access_token: string}
 * query: {limit: number, page: number}
 */
conversationsRouter.get(
  '/get_all_conversations',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  wrapAsync(getAllConversationsController)
)

/**
 * Description: Create private conversation
 * Path: /create-private
 * method: POST
 * headers: {access_token: string}
 * body: {receiver_id: string}
 */
conversationsRouter.post(
  '/create-private',
  accessTokenValidator,
  verifyUserValidator,
  createPrivateConversationValidator,
  wrapAsync(createPrivateConversationController)
)

/**
 * Description: Get conversation details
 * Path: /:conversation_id
 * method: GET
 * headers: {access_token: string}
 * params: {conversation_id: string}
 */
conversationsRouter.get(
  '/:conversation_id',
  accessTokenValidator,
  verifyUserValidator,
  deleteConversationValidator, // Reuse for conversation validation
  wrapAsync(getConversationDetailsController)
)

/**
 * Description: Delete conversation
 * Path: /:conversation_id
 * method: DELETE
 * headers: {access_token: string}
 * params: {conversation_id: string}
 */
conversationsRouter.delete(
  '/:conversation_id',
  accessTokenValidator,
  verifyUserValidator,
  deleteConversationValidator,
  wrapAsync(deleteConversationController)
)

/**
 * Description: Mute conversation
 * Path: /:conversation_id/mute
 * method: POST
 * headers: {access_token: string}
 * params: {conversation_id: string}
 * body: {mute_until?: Date} // Optional mute duration
 */
conversationsRouter.post(
  '/:conversation_id/mute',
  accessTokenValidator,
  verifyUserValidator,
  muteConversationValidator,
  wrapAsync(muteConversationController)
)

/**
 * Description: Unmute conversation
 * Path: /:conversation_id/unmute
 * method: POST
 * headers: {access_token: string}
 * params: {conversation_id: string}
 */
conversationsRouter.post(
  '/:conversation_id/unmute',
  accessTokenValidator,
  verifyUserValidator,
  deleteConversationValidator, // Reuse for conversation validation
  wrapAsync(unmuteConversationController)
)

/**
 * Description: Pin conversation
 * Path: /:conversation_id/pin
 * method: POST
 * headers: {access_token: string}
 * params: {conversation_id: string}
 */
conversationsRouter.post(
  '/:conversation_id/pin',
  accessTokenValidator,
  verifyUserValidator,
  pinConversationValidator,
  wrapAsync(pinConversationController)
)

/**
 * Description: Unpin conversation
 * Path: /:conversation_id/unpin
 * method: POST
 * headers: {access_token: string}
 * params: {conversation_id: string}
 */
conversationsRouter.post(
  '/:conversation_id/unpin',
  accessTokenValidator,
  verifyUserValidator,
  deleteConversationValidator, // Reuse for conversation validation
  wrapAsync(unpinConversationController)
)

/**
 * Description: Search conversations
 * Path: /search
 * method: GET
 * headers: {access_token: string}
 * query: {search_term: string, limit: number, page: number}
 */
conversationsRouter.get(
  '/search',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  searchConversationsValidator,
  wrapAsync(searchConversationsController)
)

export default conversationsRouter
