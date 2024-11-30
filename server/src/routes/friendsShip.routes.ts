import { Router } from 'express'
import { reject } from 'lodash'
import {
  acceptFriendRequestController,
  addFriendsController,
  friendshipSuggestionsController,
  getAllFriendsController,
  getFriendRequestsController,
  rejectFriendRequestController,
  unFriendsController
} from '~/controllers/friendsShip.controllers'
import {
  acceptFriendsValidator,
  addFriendsValidator,
  rejectFriendsValidator,
  unFriendsValidator
} from '~/middlewares/friendsShip.middlewares'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

export const friendShipsRouter = Router()

/**
 * Description: add friend
 * Path: /friend_id
 * method: POST
 * body: {email: string, password: string}
 */
friendShipsRouter.post(
  '/add',
  accessTokenValidator,
  verifyUserValidator,
  addFriendsValidator,
  wrapAsync(addFriendsController)
)

/**
 * Description: unfriend
 * Path: /unfriend/:user_id
 * method: POST
 * body: {email: string, password: string}
 */
friendShipsRouter.delete(
  '/unfriend/:friend_id',
  accessTokenValidator,
  verifyUserValidator,
  unFriendsValidator,
  wrapAsync(unFriendsController)
)

/**
 * Description: Friendship suggestions
 * Path: /friendship-suggestions
 * method: GET
 * headers: {access_token: string}
 */
friendShipsRouter.get(
  '/friendship-suggestions',
  accessTokenValidator,
  verifyUserValidator,
  wrapAsync(friendshipSuggestionsController)
)

/**
 * Description: get all friends
 * Path: /all-friends
 * method: GET
 * headers: {access_token: string}
 */
friendShipsRouter.get('/all-friends', accessTokenValidator, verifyUserValidator, wrapAsync(getAllFriendsController))

/**
 * Description: get friend request (request accept friend)
 * Path: /get-requests-accept
 * method: GET
 * headers: {access_token: string}
 */
friendShipsRouter.get(
  '/get-requests-accept',
  accessTokenValidator,
  verifyUserValidator,
  wrapAsync(getFriendRequestsController)
)

/**
 * Description:accept friend request
 * Path: /accept/:request_id
 * method: GET
 * headers: {access_token: string}
 * params: {accept_friend_id: string}
 */
friendShipsRouter.post(
  '/accept/:accept_friend_id',
  accessTokenValidator,
  verifyUserValidator,
  acceptFriendsValidator,
  wrapAsync(acceptFriendRequestController)
)

/**
 * Description:reject friend request
 * Path: /accept/:request_id
 * method: GET
 * headers: {access_token: string}
 * params: {reject_friend_id: string}
 */
friendShipsRouter.post(
  '/reject/:reject_friend_id',
  accessTokenValidator,
  verifyUserValidator,
  rejectFriendsValidator,
  wrapAsync(rejectFriendRequestController)
)
