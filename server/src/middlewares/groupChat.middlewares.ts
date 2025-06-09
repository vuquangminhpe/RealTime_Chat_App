import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { GROUP_CHAT_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'
import databaseService from '~/services/database.services'
import { TokenPayload } from '~/models/request/User.request'
import { Request } from 'express'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { ConversationsStatus } from '~/constants/enum'
import { GroupMemberRole, GroupMemberStatus } from '~/models/schemas/groupMember.schema'

export const createGroupValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: GROUP_CHAT_MESSAGES.GROUP_NAME_REQUIRED
        },
        isString: {
          errorMessage: 'Group name must be a string'
        },
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: 'Group name must be between 1 and 100 characters'
        }
      },
      description: {
        optional: true,
        isString: {
          errorMessage: 'Description must be a string'
        },
        isLength: {
          options: {
            max: 500
          },
          errorMessage: 'Description must be maximum 500 characters'
        }
      },
      member_ids: {
        notEmpty: {
          errorMessage: GROUP_CHAT_MESSAGES.MEMBER_IDS_REQUIRED
        },
        isArray: {
          errorMessage: 'Member IDs must be an array'
        },
        custom: {
          options: async (value: string[], { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload

            if (!Array.isArray(value) || value.length === 0) {
              throw new Error('At least one member is required')
            }

            if (value.length > 50) {
              throw new Error('Maximum 50 members allowed')
            }

            // Check if creator is in member list (remove if exists)
            const memberIds = value.filter((id) => id !== user_id)

            // Verify all members exist
            const members = await databaseService.users
              .find({ _id: { $in: memberIds.map((id) => new ObjectId(id)) } })
              .toArray()

            if (members.length !== memberIds.length) {
              throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
            }

            // Update the member_ids to exclude creator
            ;(req as Request).body.member_ids = memberIds

            return true
          }
        }
      },
      avatar: {
        optional: true,
        isString: {
          errorMessage: 'Avatar must be a string'
        }
      }
    },
    ['body']
  )
)

export const addMemberValidator = validate(
  checkSchema(
    {
      group_id: {
        notEmpty: {
          errorMessage: 'Group ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload

            const group = await databaseService.conversations.findOne({
              _id: new ObjectId(value),
              type: ConversationsStatus.group
            })

            if (!group) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.GROUP_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            // Check if user is admin or owner
            const member = await databaseService.groupMembers.findOne({
              group_id: new ObjectId(value),
              user_id: new ObjectId(user_id),
              status: GroupMemberStatus.Active
            })

            if (!member || (member.role !== GroupMemberRole.Admin && member.role !== GroupMemberRole.Owner)) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.ADMIN_PERMISSION_REQUIRED,
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            return true
          }
        }
      },
      member_ids: {
        notEmpty: {
          errorMessage: GROUP_CHAT_MESSAGES.MEMBER_IDS_REQUIRED
        },
        isArray: {
          errorMessage: 'Member IDs must be an array'
        },
        custom: {
          options: async (value: string[], { req }) => {
            if (!Array.isArray(value) || value.length === 0) {
              throw new Error('At least one member ID is required')
            }

            if (value.length > 20) {
              throw new Error('Maximum 20 members can be added at once')
            }

            // Verify all members exist
            const members = await databaseService.users
              .find({ _id: { $in: value.map((id) => new ObjectId(id)) } })
              .toArray()

            if (members.length !== value.length) {
              throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
            }

            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

export const removeMemberValidator = validate(
  checkSchema(
    {
      group_id: {
        notEmpty: {
          errorMessage: 'Group ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload

            const group = await databaseService.conversations.findOne({
              _id: new ObjectId(value),
              type: ConversationsStatus.group
            })

            if (!group) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.GROUP_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            // Check if user is admin or owner
            const member = await databaseService.groupMembers.findOne({
              group_id: new ObjectId(value),
              user_id: new ObjectId(user_id),
              status: GroupMemberStatus.Active
            })

            if (!member || (member.role !== GroupMemberRole.Admin && member.role !== GroupMemberRole.Owner)) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.ADMIN_PERMISSION_REQUIRED,
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            return true
          }
        }
      },
      member_id: {
        notEmpty: {
          errorMessage: 'Member ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { group_id } = req.params as any

            // Check if member exists in group
            const member = await databaseService.groupMembers.findOne({
              group_id: new ObjectId(group_id),
              user_id: new ObjectId(value),
              status: GroupMemberStatus.Active
            })

            if (!member) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.MEMBER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            // Cannot remove owner
            if (member.role === GroupMemberRole.Owner) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.CANNOT_REMOVE_OWNER,
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

export const updateGroupValidator = validate(
  checkSchema(
    {
      group_id: {
        notEmpty: {
          errorMessage: 'Group ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload

            const group = await databaseService.conversations.findOne({
              _id: new ObjectId(value),
              type: ConversationsStatus.group
            })

            if (!group) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.GROUP_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            // Check if user is admin or owner
            const member = await databaseService.groupMembers.findOne({
              group_id: new ObjectId(value),
              user_id: new ObjectId(user_id),
              status: GroupMemberStatus.Active
            })

            if (!member || (member.role !== GroupMemberRole.Admin && member.role !== GroupMemberRole.Owner)) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.ADMIN_PERMISSION_REQUIRED,
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            return true
          }
        }
      },
      name: {
        optional: true,
        isString: {
          errorMessage: 'Group name must be a string'
        },
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: 'Group name must be between 1 and 100 characters'
        }
      },
      description: {
        optional: true,
        isString: {
          errorMessage: 'Description must be a string'
        },
        isLength: {
          options: {
            max: 500
          },
          errorMessage: 'Description must be maximum 500 characters'
        }
      },
      avatar: {
        optional: true,
        isString: {
          errorMessage: 'Avatar must be a string'
        }
      }
    },
    ['params', 'body']
  )
)

export const getGroupInfoValidator = validate(
  checkSchema(
    {
      group_id: {
        notEmpty: {
          errorMessage: 'Group ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload

            const group = await databaseService.conversations.findOne({
              _id: new ObjectId(value),
              type: ConversationsStatus.group
            })

            if (!group) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.GROUP_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            // Check if user is member
            const member = await databaseService.groupMembers.findOne({
              group_id: new ObjectId(value),
              user_id: new ObjectId(user_id),
              status: GroupMemberStatus.Active
            })

            if (!member) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.NOT_GROUP_MEMBER,
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            return true
          }
        }
      }
    },
    ['params']
  )
)

export const makeAdminValidator = validate(
  checkSchema(
    {
      group_id: {
        notEmpty: {
          errorMessage: 'Group ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload

            const group = await databaseService.conversations.findOne({
              _id: new ObjectId(value),
              type: ConversationsStatus.group
            })

            if (!group) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.GROUP_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            // Check if user is owner
            const member = await databaseService.groupMembers.findOne({
              group_id: new ObjectId(value),
              user_id: new ObjectId(user_id),
              status: GroupMemberStatus.Active
            })

            if (!member || member.role !== GroupMemberRole.Owner) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.OWNER_PERMISSION_REQUIRED,
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            return true
          }
        }
      },
      member_id: {
        notEmpty: {
          errorMessage: 'Member ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { group_id } = req.params as any

            // Check if member exists in group
            const member = await databaseService.groupMembers.findOne({
              group_id: new ObjectId(group_id),
              user_id: new ObjectId(value),
              status: GroupMemberStatus.Active
            })

            if (!member) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.MEMBER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            // Check if already admin
            if (member.role === GroupMemberRole.Admin) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.ALREADY_ADMIN,
                status: HTTP_STATUS.CONFLICT
              })
            }

            return true
          }
        }
      }
    },
    ['params']
  )
)

export const removeAdminValidator = validate(
  checkSchema(
    {
      group_id: {
        notEmpty: {
          errorMessage: 'Group ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload

            const group = await databaseService.conversations.findOne({
              _id: new ObjectId(value),
              type: ConversationsStatus.group
            })

            if (!group) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.GROUP_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            // Check if user is owner
            const member = await databaseService.groupMembers.findOne({
              group_id: new ObjectId(value),
              user_id: new ObjectId(user_id),
              status: GroupMemberStatus.Active
            })

            if (!member || member.role !== GroupMemberRole.Owner) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.OWNER_PERMISSION_REQUIRED,
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            return true
          }
        }
      },
      member_id: {
        notEmpty: {
          errorMessage: 'Member ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { group_id } = req.params as any

            // Check if member exists in group
            const member = await databaseService.groupMembers.findOne({
              group_id: new ObjectId(group_id),
              user_id: new ObjectId(value),
              status: GroupMemberStatus.Active
            })

            if (!member) {
              throw new ErrorWithStatus({
                messages: GROUP_CHAT_MESSAGES.MEMBER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            return true
          }
        }
      }
    },
    ['params']
  )
)
