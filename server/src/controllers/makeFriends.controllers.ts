/* eslint-disable @typescript-eslint/no-explicit-any */
import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { AddFriendReqBody } from '~/models/request/MakeFriend.requests'
import makeFriendServices from '~/services/makeFriends.services'
import { TokenPayload } from '~/models/request/User.request'
import { MAKE_FRIENDS_MESSAGES } from '~/constants/messages'

export const addFriendsController = async (req: Request<ParamsDictionary, any, AddFriendReqBody>, res: Response) => {
  const { friend_id } = req.body
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await makeFriendServices.addFriend(friend_id, user_id)
  res.json({
    message: MAKE_FRIENDS_MESSAGES.FRIEND_ADDED_SUCCESSFULLY,
    result
  })
}
