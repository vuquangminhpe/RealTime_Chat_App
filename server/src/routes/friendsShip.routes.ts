import { Router } from 'express'
import {
  acceptFriendRequestController,
  addFriendsController,
  cancelFriendsRequestController,
  friendshipSuggestionsController,
  getAllFriendsController,
  getFriendRequestsController,
  rejectFriendRequestController,
  searchFriendsController,
  unFriendsController,
  getAllUsersController,
  searchUsersController,
  getSentFriendRequestsController
} from '~/controllers/friendsShip.controllers'
import {
  acceptFriendsValidator,
  addFriendsValidator,
  cancelFriendsRequestValidator,
  rejectFriendsValidator,
  searchFriendsValidator,
  searchUsersValidator,
  unFriendsValidator
} from '~/middlewares/friendsShip.middlewares'
import { paginationValidator } from '~/middlewares/supports.middlewares'
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
 * Path: /unfriend/:friendship_id
 * method: DELETE
 * headers: {access_token: string}
 * params: {friendship_id: string}
 */
friendShipsRouter.delete(
  '/unfriend/:friendship_id',
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
friendShipsRouter.get(
  '/all-friends',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  wrapAsync(getAllFriendsController)
)

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
  paginationValidator,
  wrapAsync(getFriendRequestsController)
)

/**
 * Description:accept friend request
 * Path: /accept/:friendship_id
 * method: POST
 * headers: {access_token: string}
 * params: {friendship_id: string}
 */
friendShipsRouter.post(
  '/accept/:friendship_id',
  accessTokenValidator,
  verifyUserValidator,
  acceptFriendsValidator,
  wrapAsync(acceptFriendRequestController)
)

/**
 * Description:reject friend request
 * Path: /reject/:friendship_id
 * method: DELETE
 * headers: {access_token: string}
 * params: {friendship_id: string}
 */
friendShipsRouter.delete(
  '/reject/:friendship_id',
  accessTokenValidator,
  verifyUserValidator,
  rejectFriendsValidator,
  wrapAsync(rejectFriendRequestController)
)

/**
 * Description:search friend request
 * Path: /search-friends
 * method: GET
 * headers: {access_token: string}
 * query: {search: string}
 */
friendShipsRouter.get(
  '/search-friends',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  searchFriendsValidator,
  wrapAsync(searchFriendsController)
)

/**
 * Description:Cancel friend requests sent to others
 * Path: /cancel/:cancel_request_id
 * method: DELETE
 * headers: {access_token: string}
 * params: {cancel_request_id: string}
 */
friendShipsRouter.delete(
  '/cancel/:cancel_request_id',
  accessTokenValidator,
  verifyUserValidator,
  cancelFriendsRequestValidator,
  wrapAsync(cancelFriendsRequestController)
)

/**
 * Description: get all users in system
 * Path: /all-users
 * method: GET
 * headers: {access_token: string}
 * query: {page: number, limit: number}
 */
friendShipsRouter.get(
  '/all-users',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  wrapAsync(getAllUsersController)
)

/**
 * Description: search users in system
 * Path: /search-users
 * method: GET
 * headers: {access_token: string}
 * query: {search: string, page: number, limit: number}
 */
friendShipsRouter.get(
  '/search-users',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  searchUsersValidator,
  wrapAsync(searchUsersController)
)

/**
 * Description: get friend requests sent by user
 * Path: /get-requests-sent
 * method: GET
 * headers: {access_token: string}
 * query: {page: number, limit: number}
 */
friendShipsRouter.get(
  '/get-requests-sent',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  wrapAsync(getSentFriendRequestsController)
)



