import { Router } from 'express'
import { bannedUserController } from '~/controllers/banUsers.controllers'
import { bannedUserValidator } from '~/middlewares/banUser.middlewares'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

export const banUsersRouter = Router()
/**
 * Description: banned_user_id
 * Path: /:banned_user_id
 * method: POST
 * body: {email: string, password: string}
 */
banUsersRouter.delete(
  '/:banned_user_id',
  accessTokenValidator,
  verifyUserValidator,
  bannedUserValidator,
  wrapAsync(bannedUserController)
)
