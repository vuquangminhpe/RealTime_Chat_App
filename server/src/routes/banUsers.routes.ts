import { Router } from 'express'
import { bannedUserController, unBannedUserController } from '~/controllers/banUsers.controllers'
import { bannedUserValidator, unBannedUserValidator } from '~/middlewares/banUser.middlewares'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

export const banUsersRouter = Router()
/**
 * Description: Banned user
 * Path: /:banned_user_id
 * method: POST
 * body: {email: string, password: string}
 */
banUsersRouter.post(
  '/:banned_user_id',
  accessTokenValidator,
  verifyUserValidator,
  bannedUserValidator,
  wrapAsync(bannedUserController)
)

/**
 * Description: Unbanned user
 * Path: /:banned_user_id
 * method: POST
 * body: {email: string, password: string}
 */
banUsersRouter.delete(
  '/:un_banned_user_id',
  accessTokenValidator,
  verifyUserValidator,
  unBannedUserValidator,
  wrapAsync(unBannedUserController)
)
