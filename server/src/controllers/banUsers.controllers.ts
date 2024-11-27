import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { BanUserReqBody, UnBanUserReqBody } from '~/models/request/BanUser.requests'
import banUserServices from '~/services/banUsers.services'
import { TokenPayload } from '~/models/request/User.request'
import { BANNED_MESSAGES } from '~/constants/messages'

export const bannedUserController = async (req: Request<ParamsDictionary, any, BanUserReqBody>, res: Response) => {
  const { banned_user_id } = req.params
  const { user_id } = (req as Request).decode_authorization as TokenPayload
  const result = await banUserServices.banUser(banned_user_id, user_id)
  res.json({
    message: BANNED_MESSAGES.BANNED_USER_SUCCESSFULLY,
    name: result?.username
  })
}

export const unBannedUserController = async (req: Request<ParamsDictionary, any, UnBanUserReqBody>, res: Response) => {
  const { un_banned_user_id } = req.params
  const usernameUnBanUser = await banUserServices.unBanUser(un_banned_user_id)
  res.json({
    message: BANNED_MESSAGES.UN_BANNED_USER_SUCCESSFULLY,
    usernameUnBanUser
  })
}
