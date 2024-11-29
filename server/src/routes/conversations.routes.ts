import { Router } from 'express'
import { getAllConversationsController, getConversationsController } from '~/controllers/conversations.controllers'
import { paginationValidator } from '~/middlewares/supports.middlewares'
import {
  accessTokenValidator,
  getAllConversationsValidator,
  getConversationsValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

const conversationsRouter = Router()

/**
 * Description: get all conversations
 * Path: /get_all_conversations
 * method: GET
 * headers: {access_token:string}
 */
conversationsRouter.get(
  '/get_all_conversations',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  getAllConversationsValidator,
  wrapAsync(getAllConversationsController)
)

/**
 * Description: conversations
 * Path: /get_all_conversations
 * method: GET
 * headers: {access_token:string}
 */
conversationsRouter.get(
  '/receivers',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  getConversationsValidator,
  wrapAsync(getConversationsController)
)
