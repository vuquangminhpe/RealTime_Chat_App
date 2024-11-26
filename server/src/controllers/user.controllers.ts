/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express'
import userServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  EmailVerifyReqBody,
  ForgotReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  TokenPayload,
  VerifyForgotPasswordTokenReqBody
} from '~/models/request/User.request'
import { USERS_MESSAGES } from '~/constants/messages'
export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const body = req.body
  const result = await userServices.register(body)
  res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESSFULLY,
    result
  })
}

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response,
  next: NextFunction
) => {
  const body = req.body
  const result = await userServices.login(body)
  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESSFULLY,
    result
  })
}
export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { refresh_token } = req.body
  await userServices.logout(refresh_token)
  res.json({
    message: USERS_MESSAGES.LOGOUT_SUCCESSFULLY
  })
}
export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  const { user_id, verify } = req.decode_authorization as TokenPayload
  const newRefreshToken = await userServices.refreshToken({ refresh_token, user_id, verify })
  res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESSFULLY,
    result: newRefreshToken
  })
}

export const emailTokenController = async (req: Request<ParamsDictionary, any, EmailVerifyReqBody>, res: Response) => {
  const { email_verify_token } = req.body
  await userServices.verifyEmail(email_verify_token)
  res.json({
    message: USERS_MESSAGES.VERIFY_EMAIL_TOKEN_SUCCESSFULLY
  })
}
export const recentEmailTokenController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const recentEmailVerifyToken = await userServices.recentEmailVerifyToken(user_id)
  res.json({
    message: USERS_MESSAGES.GET_RECENT_EMAIL_VERIFY_TOKEN_SUCCESSFULLY,
    result: recentEmailVerifyToken
  })
}
export const forgotPasswordController = async (req: Request<ParamsDictionary, any, ForgotReqBody>, res: Response) => {
  const { email } = req.body
  const forgot_password_token = await userServices.forgotPassword(email)
  res.json({
    message: USERS_MESSAGES.FORGOT_PASSWORD_SUCCESSFULLY,
    result: {
      note: USERS_MESSAGES.PLEASE_CHECK_YOUR_EMAIL_TO_RESET_PASSWORD,
      forgot_password_token
    }
  })
}
export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenReqBody>,
  res: Response
) => {
  const { forgot_password_token } = req.body
  const user = await userServices.verifyForgotPassword(forgot_password_token)
  res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESSFULLY,
    user
  })
}
