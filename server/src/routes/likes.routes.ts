import { Router } from 'express'
import {
  likeController,
  unlikeController,
  getLikesController,
  getUserLikesController,
  checkLikeStatusController
} from '~/controllers/likes.controllers'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import {
  likeValidator,
  unlikeValidator,
  getLikesValidator,
  checkLikeStatusValidator
} from '~/middlewares/likes.middlewares'
import { paginationValidator } from '~/middlewares/supports.middlewares'
import { wrapAsync } from '~/utils/handler'

export const likesRouter = Router()

/**
 * Description: Like a target (story, message, user)
 * Path: /like
 * method: POST
 * headers: {access_token: string}
 * body: LikeReqBody
 */
likesRouter.post('/like', accessTokenValidator, verifyUserValidator, likeValidator, wrapAsync(likeController))

/**
 * Description: Unlike a target
 * Path: /unlike
 * method: DELETE
 * headers: {access_token: string}
 * body: UnlikeReqBody
 */
likesRouter.delete('/unlike', accessTokenValidator, verifyUserValidator, unlikeValidator, wrapAsync(unlikeController))

/**
 * Description: Get likes for a target
 * Path: /
 * method: GET
 * headers: {access_token: string}
 * query: GetLikesReqQuery
 */
likesRouter.get(
  '/',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  getLikesValidator,
  wrapAsync(getLikesController)
)

/**
 * Description: Get user's likes
 * Path: /user
 * method: GET
 * headers: {access_token: string}
 * query: {limit: number, page: number}
 */
likesRouter.get(
  '/user',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  wrapAsync(getUserLikesController)
)

/**
 * Description: Check if user liked a target
 * Path: /status
 * method: GET
 * headers: {access_token: string}
 * query: CheckLikeStatusReqQuery
 */
likesRouter.get(
  '/status',
  accessTokenValidator,
  verifyUserValidator,
  checkLikeStatusValidator,
  wrapAsync(checkLikeStatusController)
)
