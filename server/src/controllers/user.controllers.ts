/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express'
import userServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { LoginReqBody, LogoutReqBody, RegisterReqBody } from '~/models/request/User.request'
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
