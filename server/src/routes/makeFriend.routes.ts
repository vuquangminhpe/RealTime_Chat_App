import { Router } from 'express'
import { addFriendsController } from '~/controllers/makeFriends.controllers'
import { addFriendsValidator } from '~/middlewares/makeFriends.middlewares'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

export const makeFriendsRouter = Router()

/**
 * Description: add friend
 * Path: /friend_id
 * method: POST
 * body: {email: string, password: string}
 */

makeFriendsRouter.post(
  '/add',
  accessTokenValidator,
  verifyUserValidator,
  addFriendsValidator,
  wrapAsync(addFriendsController)
)
