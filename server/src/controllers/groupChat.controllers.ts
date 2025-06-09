import { Request, Response, NextFunction } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  CreateGroupReqBody,
  AddMemberReqBody,
  RemoveMemberReqBody,
  UpdateGroupReqBody
} from '~/models/request/GroupChat.requests'
import { TokenPayload } from '~/models/request/User.request'
import groupChatServices from '~/services/groupChat.services'
import { GROUP_CHAT_MESSAGES } from '~/constants/messages'

export const createGroupController = async (
  req: Request<ParamsDictionary, any, CreateGroupReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await groupChatServices.createGroup(user_id, req.body)
  res.json({
    message: GROUP_CHAT_MESSAGES.CREATE_GROUP_SUCCESS,
    result
  })
}

export const addMemberController = async (
  req: Request<ParamsDictionary, any, AddMemberReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { group_id } = req.params
  const result = await groupChatServices.addMember(user_id, group_id, req.body.member_ids)
  res.json({
    message: GROUP_CHAT_MESSAGES.ADD_MEMBER_SUCCESS,
    result
  })
}

export const removeMemberController = async (
  req: Request<ParamsDictionary, any, RemoveMemberReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { group_id } = req.params
  const { member_id } = req.body
  await groupChatServices.removeMember(user_id, group_id, member_id)
  res.json({
    message: GROUP_CHAT_MESSAGES.REMOVE_MEMBER_SUCCESS
  })
}

export const leaveGroupController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { group_id } = req.params
  await groupChatServices.leaveGroup(user_id, group_id)
  res.json({
    message: GROUP_CHAT_MESSAGES.LEAVE_GROUP_SUCCESS
  })
}

export const updateGroupController = async (
  req: Request<ParamsDictionary, any, UpdateGroupReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { group_id } = req.params
  const result = await groupChatServices.updateGroup(user_id, group_id, req.body)
  res.json({
    message: GROUP_CHAT_MESSAGES.UPDATE_GROUP_SUCCESS,
    result
  })
}

export const getGroupInfoController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { group_id } = req.params
  const result = await groupChatServices.getGroupInfo(user_id, group_id)
  res.json({
    message: GROUP_CHAT_MESSAGES.GET_GROUP_INFO_SUCCESS,
    result
  })
}

export const getGroupMembersController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { group_id } = req.params
  const { limit, page } = req.query
  const result = await groupChatServices.getGroupMembers(user_id, group_id, Number(limit), Number(page))
  res.json({
    message: GROUP_CHAT_MESSAGES.GET_GROUP_MEMBERS_SUCCESS,
    result: result.members,
    page: Number(page),
    total_pages: Math.ceil(result.total / Number(limit))
  })
}

export const getUserGroupsController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { limit, page } = req.query
  const result = await groupChatServices.getUserGroups(user_id, Number(limit), Number(page))
  res.json({
    message: GROUP_CHAT_MESSAGES.GET_USER_GROUPS_SUCCESS,
    result: result.groups,
    page: Number(page),
    total_pages: Math.ceil(result.total / Number(limit))
  })
}

export const makeAdminController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { group_id, member_id } = req.params
  await groupChatServices.makeAdmin(user_id, group_id, member_id)
  res.json({
    message: GROUP_CHAT_MESSAGES.MAKE_ADMIN_SUCCESS
  })
}

export const removeAdminController = async (
  req: Request<ParamsDictionary, any, any>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { group_id, member_id } = req.params
  await groupChatServices.removeAdmin(user_id, group_id, member_id)
  res.json({
    message: GROUP_CHAT_MESSAGES.REMOVE_ADMIN_SUCCESS
  })
}
