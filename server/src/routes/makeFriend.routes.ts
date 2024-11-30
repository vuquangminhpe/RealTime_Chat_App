import { Router } from 'express'
import {
  acceptFriendRequestController,
  addFriendsController,
  friendshipSuggestionsController,
  getAllFriendsController,
  getFriendRequestsController,
  unFriendsController
} from '~/controllers/makeFriends.controllers'
import { addFriendsValidator, unFriendsValidator } from '~/middlewares/makeFriends.middlewares'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

export const makeFriendsRouter = Router()

/**
 * Description: add friend
 * Path: /friend_id
 * method: POST
 * body: {email: string, password: string}
 */
makeFriendsRouter.post(
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
makeFriendsRouter.delete(
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
makeFriendsRouter.get(
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
makeFriendsRouter.get('/all-friends', accessTokenValidator, verifyUserValidator, wrapAsync(getAllFriendsController))

/**
 * Description: friend request
 * Path: /friend-requests
 * method: GET
 * headers: {access_token: string}
 */
makeFriendsRouter.get(
  '/friend-requests',
  accessTokenValidator,
  verifyUserValidator,
  wrapAsync(getFriendRequestsController)
)

/**
 * Description: friend request accept
 * Path: /friend-requests/accept/:request_id
 * method: GET
 * headers: {access_token: string}
 */
makeFriendsRouter.post(
  '/friend-requests/accept/:request_id',
  accessTokenValidator,
  verifyUserValidator,
  wrapAsync(acceptFriendRequestController)
)
