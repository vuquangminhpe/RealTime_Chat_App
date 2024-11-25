import { Router } from 'express'
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController
} from '~/controllers/user.controllers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

export const usersRouter = Router()

/**
 * Description: register
 * Path: /register
 * method: POST
 * body: {email: string, password: string}
 */

usersRouter.post('/register', registerValidator, wrapAsync(registerController))

/**
 * Description: login
 * Path: /login
 * method: POST
 * body: {email: string, password: string}
 */

usersRouter.post('/login', loginValidator, wrapAsync(loginController))

/**
 * Description: logout
 * Path: /logout
 * method: POST
 * headers: {access_token:string}
 * body: {refresh_token:string}
 */

usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

/**
 * Description: change refresh token
 * Path: /refresh_token
 * method: POST
 * headers: {access_token:string}
 * body: {refresh_token:string}
 */
usersRouter.post('/refresh-token', accessTokenValidator, refreshTokenValidator, wrapAsync(refreshTokenController))
