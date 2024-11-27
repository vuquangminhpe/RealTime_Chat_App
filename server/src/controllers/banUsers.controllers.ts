import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { BanUserReqBody } from '~/models/request/BanUser.requests'
import banUserServices from '~/services/banUsers.services'
import { TokenPayload } from '~/models/request/User.request'
import { BANNED_MESSAGES } from '~/constants/messages'

export const bannedUserController = async (req: Request<ParamsDictionary, any, BanUserReqBody>, res: Response) => {
  const { banned_user_id } = req.params
  const { user_id } = (req as Request).decode_authorization as TokenPayload
  await banUserServices.banUser(banned_user_id, user_id)
  res.json({
    message: BANNED_MESSAGES.BANNED_USER_SUCCESSFULLY,
    result: banned_user_id
  })
}
