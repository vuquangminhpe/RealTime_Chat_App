/* eslint-disable @typescript-eslint/no-explicit-any */
import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { AddFriendReqBody, unFriendReqBody } from '~/models/request/friendShip.requests'
import { TokenPayload } from '~/models/request/User.request'
import { FRIENDS_SHIP_MESSAGES } from '~/constants/messages'
import friendsShipServices from '~/services/friendsShip.services'

export const addFriendsController = async (req: Request<ParamsDictionary, any, AddFriendReqBody>, res: Response) => {
  const { friend_id } = req.body
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await friendsShipServices.addFriend(friend_id, user_id)
  res.json({
    message: FRIENDS_SHIP_MESSAGES.FRIEND_ADDED_SUCCESSFULLY,
    result
  })
}

export const unFriendsController = async (req: Request<ParamsDictionary, any, unFriendReqBody>, res: Response) => {
  const { friendship_id } = req.params
  const { user_id } = (req as Request).decode_authorization as TokenPayload
  await friendsShipServices.unFriend(friendship_id, user_id)
  res.json({
    message: FRIENDS_SHIP_MESSAGES.REMOVED_FRIEND_SUCCESSFULLY
  })
}

export const friendshipSuggestionsController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = (req as Request).decode_authorization as TokenPayload
  const { limit, page } = req.query
  const { friend_suggestions, total } = await friendsShipServices.friendshipSuggestions(
    user_id,
    Number(limit),
    Number(page)
  )
  res.json({
    message: FRIENDS_SHIP_MESSAGES.GET_FRIEND_SUGGESTIONS_SUCCESSFULLY,
    result: friend_suggestions,
    page: Number(page),
    total_pages: Math.ceil(total / Number(limit))
  })
}

export const getAllFriendsController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = (req as Request).decode_authorization as TokenPayload
  const { limit, page } = req.query
  const friends = await friendsShipServices.getAllFriends(user_id, Number(limit), Number(page))
  res.json({
    message: FRIENDS_SHIP_MESSAGES.GET_ALL_FRIENDS_SUCCESSFULLY,
    result: friends.friends,
    page: Number(page),
    total_pages: Math.ceil(friends.total / Number(limit))
  })
}

export const getFriendRequestsController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = (req as Request).decode_authorization as TokenPayload
  const { limit, page } = req.query
  const friend_requests = await friendsShipServices.getFriendRequests(user_id, Number(limit), Number(page))
  res.json({
    message: FRIENDS_SHIP_MESSAGES.GET_FRIEND_REQUESTS_SUCCESSFULLY,
    result: friend_requests.friend_requests,
    page: Number(page),
    total_pages: Math.ceil(friend_requests.total / Number(limit))
  })
}

export const acceptFriendRequestController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { friendship_id } = req.params
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await friendsShipServices.acceptFriendRequest(friendship_id, user_id)
  res.json({
    message: FRIENDS_SHIP_MESSAGES.FRIEND_REQUEST_ACCEPTED_SUCCESSFULLY,
    result
  })
}

export const rejectFriendRequestController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { friendship_id } = req.params
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await friendsShipServices.rejectFriendRequest(friendship_id, user_id)
  res.json({
    message: FRIENDS_SHIP_MESSAGES.FRIEND_REQUEST_REJECTED_SUCCESSFULLY,
    result
  })
}

export const searchFriendsController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { search } = req.query
  const { limit, page } = req.query
  const result = await friendsShipServices.searchFriends(user_id, search as string, Number(limit), Number(page))
  res.json({
    message: FRIENDS_SHIP_MESSAGES.GET_FRIENDS_SUCCESSFULLY,
    result: result.friend_suggestions,
    page: Number(page),
    total_pages: Math.ceil(result.total / Number(limit))
  })
}

export const cancelFriendsRequestController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { cancel_request_id } = req.params
  const { user_id } = req.decode_authorization as TokenPayload
  await friendsShipServices.cancelFriendRequest(cancel_request_id, user_id)
  res.json({
    message: FRIENDS_SHIP_MESSAGES.CANCEL_FRIEND_REQUEST_SUCCESSFULLY
  })
}

export const getAllUsersController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = (req as Request).decode_authorization as TokenPayload
  const { limit, page } = req.query
  const result = await friendsShipServices.getAllUsers(user_id, Number(limit), Number(page))
  res.json({
    message: FRIENDS_SHIP_MESSAGES.GET_ALL_USERS_SUCCESSFULLY,
    result: result.users,
    page: Number(page),
    total_pages: Math.ceil(result.total / Number(limit))
  })
}

export const searchUsersController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = (req as Request).decode_authorization as TokenPayload
  const { search } = req.query
  const { limit, page } = req.query
  const result = await friendsShipServices.searchUsers(user_id, search as string, Number(limit), Number(page))
  res.json({
    message: FRIENDS_SHIP_MESSAGES.SEARCH_USERS_SUCCESSFULLY,
    result: result.users,
    page: Number(page),
    total_pages: Math.ceil(result.total / Number(limit))
  })
}

export const getSentFriendRequestsController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { limit, page } = req.query
  const sent_requests = await friendsShipServices.getSentFriendRequests(user_id, Number(limit), Number(page))
  res.json({
    message: FRIENDS_SHIP_MESSAGES.GET_SENT_REQUESTS_SUCCESSFULLY,
    result: sent_requests.sent_requests,
    page: Number(page),
    total_pages: Math.ceil(sent_requests.total / Number(limit))
  })
}
