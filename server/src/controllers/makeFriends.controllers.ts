/* eslint-disable @typescript-eslint/no-explicit-any */
import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { AddFriendReqBody, unFriendReqBody } from '~/models/request/MakeFriend.requests'
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

export const unFriendsController = async (req: Request<ParamsDictionary, any, unFriendReqBody>, res: Response) => {
  const { friend_id } = req.params
  const { user_id } = (req as Request).decode_authorization as TokenPayload
  console.log(friend_id, user_id)

  await makeFriendServices.unFriend(friend_id, user_id)
  res.json({
    message: MAKE_FRIENDS_MESSAGES.REMOVED_FRIEND_SUCCESSFULLY
  })
}
