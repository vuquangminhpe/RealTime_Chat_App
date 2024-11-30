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
  await makeFriendServices.unFriend(friend_id, user_id)
  res.json({
    message: MAKE_FRIENDS_MESSAGES.REMOVED_FRIEND_SUCCESSFULLY
  })
}

export const friendshipSuggestionsController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = (req as Request).decode_authorization as TokenPayload
  const friend_suggestions = await makeFriendServices.friendshipSuggestions(user_id)
  res.json({
    result: friend_suggestions
  })
}

export const getAllFriendsController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = (req as Request).decode_authorization as TokenPayload
  const friends = await makeFriendServices.getAllFriends(user_id)
  res.json({
    result: friends
  })
}

export const getFriendRequestsController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = (req as Request).decode_authorization as TokenPayload
  const friend_requests = await makeFriendServices.getFriendRequests(user_id)
  res.json({
    result: friend_requests
  })
}

export const acceptFriendRequestController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { friend_id } = req.body
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await makeFriendServices.acceptFriendRequest(friend_id, user_id)
  res.json({
    message: MAKE_FRIENDS_MESSAGES.FRIEND_REQUEST_ACCEPTED,
    result
  })
}
