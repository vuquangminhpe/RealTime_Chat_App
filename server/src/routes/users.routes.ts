import { Router } from 'express'
import {
  emailTokenController,
  forgotPasswordController,
  loginController,
  logoutController,
  recentEmailTokenController,
  refreshTokenController,
  registerController,
  verifyForgotPasswordController
} from '~/controllers/user.controllers'
import {
  accessTokenValidator,
  forgotPasswordTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyEmailTokenValidator,
  verifyForgotPasswordTokenValidator
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

/**
 * Description: email verify
 * Path: /verify-email
 * method: POST
 * headers: {access_token:string}
 * body: {email_verify_token:string}
 */
usersRouter.post('/verify-email', verifyEmailTokenValidator, wrapAsync(emailTokenController))

/**
 * Description: recent email verify
 * Path: /verify-email
 * method: POST
 * headers: {access_token:string}
 * body: {email_verify_token:string}
 */
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(recentEmailTokenController))

/**
 * Description: forgot password
 * Path: /forgot-password
 * method: POST
 * headers: {access_token:string}
 * body: {email_verify_token:string}
 */
usersRouter.post('/forgot-password', forgotPasswordTokenValidator, wrapAsync(forgotPasswordController))

/**
 * Description: verify forgot password
 * Path: /verify-forgot-password
 * method: POST
 * headers: {access_token:string}
 * body: {forgot_password_token:string}
 */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordController)
)
