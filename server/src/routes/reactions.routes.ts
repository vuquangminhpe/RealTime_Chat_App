import { Router } from 'express'
import {
  addReactionController,
  removeReactionController,
  getReactionsController,
  getUserReactionsController
} from '~/controllers/reactions.controllers'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import {
  addReactionValidator,
  removeReactionValidator,
  getReactionsValidator
} from '~/middlewares/reactions.middlewares'
import { paginationValidator } from '~/middlewares/supports.middlewares'
import { wrapAsync } from '~/utils/handler'

export const reactionsRouter = Router()

/**
 * Description: Add reaction to target (story, message, etc.)
 * Path: /add
 * method: POST
 * headers: {access_token: string}
 * body: AddReactionReqBody
 */
reactionsRouter.post(
  '/add',
  accessTokenValidator,
  verifyUserValidator,
  addReactionValidator,
  wrapAsync(addReactionController)
)

/**
 * Description: Remove reaction from target
 * Path: /remove
 * method: DELETE
 * headers: {access_token: string}
 * body: RemoveReactionReqBody
 */
reactionsRouter.delete(
  '/remove',
  accessTokenValidator,
  verifyUserValidator,
  removeReactionValidator,
  wrapAsync(removeReactionController)
)

/**
 * Description: Get reactions for a target
 * Path: /
 * method: GET
 * headers: {access_token: string}
 * query: {target_id: string, target_type: string, limit: number, page: number}
 */
reactionsRouter.get(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  getReactionsValidator,
  wrapAsync(getReactionsController)
)

/**
 * Description: Get user's reactions
 * Path: /user
 * method: GET
 * headers: {access_token: string}
 * query: {limit: number, page: number}
 */
reactionsRouter.get(
  '/user',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  wrapAsync(getUserReactionsController)
)
