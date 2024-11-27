import { Router } from 'express'
import {
  emailTokenController,
  forgotPasswordController,
  getMyProfileController,
  getUserController,
  loginController,
  logoutController,
  recentEmailTokenController,
  refreshTokenController,
  registerController,
  resetPasswordController,
  UpdateMyProfileController,
  verifyForgotPasswordController
} from '~/controllers/user.controllers'
import {
  accessTokenValidator,
  forgotPasswordTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMyProfileValidator,
  verifyEmailTokenValidator,
  verifyForgotPasswordTokenValidator,
  verifyUserValidator
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
 * body: {forgot_password_token:string}
 */
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordController)
)

/**
 * Description: reset password
 * Path: /reset-password
 * method: POST
 * headers: {access_token:string}
 * body: {password,confirm_password,forgot_password_token:string}
 */
usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)

/**
 * Description: get my (my profile)
 * Path: /my
 * method: get
 * headers: {access_token:string}
 */

usersRouter.get('/me', accessTokenValidator, verifyUserValidator, wrapAsync(getMyProfileController))

/**
 * Description: get my (my profile)
 * Path: /my
 * method: get
 * headers: {access_token:string}
 * body: type User
 */

usersRouter.put(
  '/me',
  accessTokenValidator,
  verifyUserValidator,
  updateMyProfileValidator,
  wrapAsync(UpdateMyProfileController)
)

/**
 * Description: get user (user profile (Just things that are public ))
 * Path: /:username
 * method: get
 * headers: {access_token:string}
 */
usersRouter.get('/:username', accessTokenValidator, wrapAsync(getUserController))
