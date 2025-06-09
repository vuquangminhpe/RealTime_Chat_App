import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { CONVERSATIONS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'
import databaseService from '~/services/database.services'
import { TokenPayload } from '~/models/request/User.request'
import { Request } from 'express'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { ConversationsStatus } from '~/constants/enum'

export const getConversationValidator = validate(
  checkSchema(
    {
      receiver_id: {
        notEmpty: {
          errorMessage: 'Receiver ID is required'
        },
        custom: {
          options: async (value: string | string[], { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload
            let receiverIds: string[] = []

            // Handle both string and array formats
            if (typeof value === 'string') {
              receiverIds = [value]
            } else if (Array.isArray(value)) {
              receiverIds = value
            } else {
              throw new Error('Receiver ID must be string or array of strings')
            }

            // Remove current user from receiver list if present
            receiverIds = receiverIds.filter((id) => id !== user_id)

            if (receiverIds.length === 0) {
              throw new Error('At least one valid receiver is required')
            }

            // Verify all receiver users exist
            const users = await databaseService.users
              .find({ _id: { $in: receiverIds.map((id) => new ObjectId(id)) } })
              .toArray()

            if (users.length !== receiverIds.length) {
              throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
            }

            // Update the receiver_id in request
            ;(req as Request).query.receiver_id = receiverIds

            return true
          }
        }
      },
      type: {
        notEmpty: {
          errorMessage: CONVERSATIONS_MESSAGES.TYPE_MUST_BE_PRIVATE_OR_GROUP
        },
        custom: {
          options: (value: string) => {
            if (!['private', 'group'].includes(value)) {
              throw new Error(CONVERSATIONS_MESSAGES.TYPE_MUST_BE_PRIVATE_OR_GROUP)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)

export const createPrivateConversationValidator = validate(
  checkSchema(
    {
      receiver_id: {
        notEmpty: {
          errorMessage: 'Receiver ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload

            // Check if trying to create conversation with self
            if (value === user_id) {
              throw new Error('Cannot create conversation with yourself')
            }

            // Verify receiver exists
            const receiver = await databaseService.users.findOne({ _id: new ObjectId(value) })
            if (!receiver) {
              throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
            }

            // Check if private conversation already exists
            const existingConversation = await databaseService.conversations.findOne({
              type: ConversationsStatus.private,
              $or: [
                {
                  sender_id: new ObjectId(user_id),
                  receiver_id: { $in: [new ObjectId(value)] }
                },
                {
                  sender_id: new ObjectId(value),
                  receiver_id: { $in: [new ObjectId(user_id)] }
                }
              ]
            })

            if (existingConversation) {
              throw new ErrorWithStatus({
                messages: 'Private conversation already exists',
                status: HTTP_STATUS.CONFLICT
              })
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const deleteConversationValidator = validate(
  checkSchema(
    {
      conversation_id: {
        notEmpty: {
          errorMessage: 'Conversation ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload

            const conversation = await databaseService.conversations.findOne({
              _id: new ObjectId(value)
            })

            if (!conversation) {
              throw new ErrorWithStatus({
                messages: CONVERSATIONS_MESSAGES.NO_CONVERSATION,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            // Check if user is participant
            const isParticipant =
              conversation.sender_id.toString() === user_id ||
              conversation.receiver_id.some((id) => id.toString() === user_id)

            if (!isParticipant) {
              throw new ErrorWithStatus({
                messages: 'You are not a participant in this conversation',
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

export const muteConversationValidator = validate(
  checkSchema(
    {
      conversation_id: {
        notEmpty: {
          errorMessage: 'Conversation ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload

            const conversation = await databaseService.conversations.findOne({
              _id: new ObjectId(value)
            })

            if (!conversation) {
              throw new ErrorWithStatus({
                messages: CONVERSATIONS_MESSAGES.NO_CONVERSATION,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            // Check if user is participant
            const isParticipant =
              conversation.sender_id.toString() === user_id ||
              conversation.receiver_id.some((id) => id.toString() === user_id)

            if (!isParticipant) {
              throw new ErrorWithStatus({
                messages: 'You are not a participant in this conversation',
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            return true
          }
        }
      },
      mute_until: {
        optional: true,
        isISO8601: {
          errorMessage: 'Mute until must be a valid ISO 8601 date'
        },
        custom: {
          options: (value: string) => {
            if (value) {
              const muteDate = new Date(value)
              const now = new Date()

              if (muteDate <= now) {
                throw new Error('Mute until date must be in the future')
              }
            }
            return true
          }
        }
      }
    },
    ['params', 'body']
  )
)

export const pinConversationValidator = validate(
  checkSchema(
    {
      conversation_id: {
        notEmpty: {
          errorMessage: 'Conversation ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload

            const conversation = await databaseService.conversations.findOne({
              _id: new ObjectId(value)
            })

            if (!conversation) {
              throw new ErrorWithStatus({
                messages: CONVERSATIONS_MESSAGES.NO_CONVERSATION,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            // Check if user is participant
            const isParticipant =
              conversation.sender_id.toString() === user_id ||
              conversation.receiver_id.some((id) => id.toString() === user_id)

            if (!isParticipant) {
              throw new ErrorWithStatus({
                messages: 'You are not a participant in this conversation',
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            const userSettings = await databaseService.conversationSettings?.findOne({
              user_id: new ObjectId(user_id),
              conversation_id: new ObjectId(value)
            })

            if (userSettings?.pinned) {
              throw new ErrorWithStatus({
                messages: 'Conversation is already pinned',
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

export const searchConversationsValidator = validate(
  checkSchema(
    {
      search_term: {
        notEmpty: {
          errorMessage: 'Search term is required'
        },
        isString: {
          errorMessage: 'Search term must be a string'
        },
        isLength: {
          options: {
            min: 1,
            max: 100
          },
          errorMessage: 'Search term must be between 1 and 100 characters'
        }
      }
    },
    ['query']
  )
)
