import { Router } from 'express'
import {
  createGroupController,
  addMemberController,
  removeMemberController,
  leaveGroupController,
  updateGroupController,
  getGroupInfoController,
  getGroupMembersController,
  getUserGroupsController,
  makeAdminController,
  removeAdminController
} from '~/controllers/groupChat.controllers'
import { accessTokenValidator, verifyUserValidator } from '~/middlewares/users.middlewares'
import {
  createGroupValidator,
  addMemberValidator,
  removeMemberValidator,
  updateGroupValidator,
  getGroupInfoValidator,
  makeAdminValidator,
  removeAdminValidator
} from '~/middlewares/groupChat.middlewares'
import { paginationValidator } from '~/middlewares/supports.middlewares'
import { wrapAsync } from '~/utils/handler'

export const groupChatRouter = Router()

/**
 * Description: Create new group
 * Path: /create
 * method: POST
 * headers: {access_token: string}
 * body: CreateGroupReqBody
 */
groupChatRouter.post(
  '/create',
  accessTokenValidator,
  verifyUserValidator,
  createGroupValidator,
  wrapAsync(createGroupController)
)

/**
 * Description: Add members to group
 * Path: /:group_id/add-member
 * method: POST
 * headers: {access_token: string}
 * params: {group_id: string}
 * body: AddMemberReqBody
 */
groupChatRouter.post(
  '/:group_id/add-member',
  accessTokenValidator,
  verifyUserValidator,
  addMemberValidator,
  wrapAsync(addMemberController)
)

/**
 * Description: Remove member from group
 * Path: /:group_id/remove-member
 * method: DELETE
 * headers: {access_token: string}
 * params: {group_id: string}
 * body: RemoveMemberReqBody
 */
groupChatRouter.delete(
  '/:group_id/remove-member',
  accessTokenValidator,
  verifyUserValidator,
  removeMemberValidator,
  wrapAsync(removeMemberController)
)

/**
 * Description: Leave group
 * Path: /:group_id/leave
 * method: POST
 * headers: {access_token: string}
 * params: {group_id: string}
 */
groupChatRouter.post(
  '/:group_id/leave',
  accessTokenValidator,
  verifyUserValidator,
  getGroupInfoValidator, // Reuse for group_id validation
  wrapAsync(leaveGroupController)
)

/**
 * Description: Update group information
 * Path: /:group_id
 * method: PUT
 * headers: {access_token: string}
 * params: {group_id: string}
 * body: UpdateGroupReqBody
 */
groupChatRouter.put(
  '/:group_id',
  accessTokenValidator,
  verifyUserValidator,
  updateGroupValidator,
  wrapAsync(updateGroupController)
)

/**
 * Description: Get group information
 * Path: /:group_id
 * method: GET
 * headers: {access_token: string}
 * params: {group_id: string}
 */
groupChatRouter.get(
  '/:group_id',
  accessTokenValidator,
  verifyUserValidator,
  getGroupInfoValidator,
  wrapAsync(getGroupInfoController)
)

/**
 * Description: Get group members
 * Path: /:group_id/members
 * method: GET
 * headers: {access_token: string}
 * params: {group_id: string}
 * query: {limit: number, page: number}
 */
groupChatRouter.get(
  '/:group_id/members',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  getGroupInfoValidator, // Reuse for group_id validation
  wrapAsync(getGroupMembersController)
)

/**
 * Description: Get user's groups
 * Path: /user
 * method: GET
 * headers: {access_token: string}
 * query: {limit: number, page: number}
 */
groupChatRouter.get(
  '/user',
  accessTokenValidator,
  verifyUserValidator,
  paginationValidator,
  wrapAsync(getUserGroupsController)
)

/**
 * Description: Make member admin
 * Path: /:group_id/make-admin/:member_id
 * method: POST
 * headers: {access_token: string}
 * params: {group_id: string, member_id: string}
 */
groupChatRouter.post(
  '/:group_id/make-admin/:member_id',
  accessTokenValidator,
  verifyUserValidator,
  makeAdminValidator,
  wrapAsync(makeAdminController)
)

/**
 * Description: Remove admin role
 * Path: /:group_id/remove-admin/:member_id
 * method: DELETE
 * headers: {access_token: string}
 * params: {group_id: string, member_id: string}
 */
groupChatRouter.delete(
  '/:group_id/remove-admin/:member_id',
  accessTokenValidator,
  verifyUserValidator,
  removeAdminValidator,
  wrapAsync(removeAdminController)
)
