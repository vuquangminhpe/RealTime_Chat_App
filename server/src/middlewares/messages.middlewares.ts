import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { MESSAGES_MESSAGES, CONVERSATIONS_MESSAGES } from '~/constants/messages'
import { MessageTypes } from '~/models/schemas/message.chema'
import { validate } from '~/utils/validation'
import databaseService from '~/services/database.services'
import { TokenPayload } from '~/models/request/User.request'
import { Request } from 'express'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'

export const sendMessageValidator = validate(
  checkSchema(
    {
      conversation_id: {
        notEmpty: {
          errorMessage: MESSAGES_MESSAGES.CONVERSATION_ID_REQUIRED
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
                messages: MESSAGES_MESSAGES.NOT_CONVERSATION_PARTICIPANT,
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            return true
          }
        }
      },
      content: {
        notEmpty: {
          errorMessage: MESSAGES_MESSAGES.CONTENT_IS_REQUIRED
        },
        isString: {
          errorMessage: 'Content must be a string'
        }
      },
      message_type: {
        optional: true,
        custom: {
          options: (value) => {
            if (value && !Object.values(MessageTypes).includes(value)) {
              throw new Error('Invalid message type')
            }
            return true
          }
        }
      },
      reply_to: {
        optional: true,
        custom: {
          options: async (value: string, { req }) => {
            if (value) {
              const { conversation_id } = req.body
              const replyMessage = await databaseService.messages.findOne({
                _id: new ObjectId(value),
                conversation_id: new ObjectId(conversation_id)
              })

              if (!replyMessage) {
                throw new Error('Reply message not found in this conversation')
              }
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const editMessageValidator = validate(
  checkSchema(
    {
      message_id: {
        notEmpty: {
          errorMessage: MESSAGES_MESSAGES.MESSAGE_ID_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload
            const message = await databaseService.messages.findOne({
              _id: new ObjectId(value)
            })

            if (!message) {
              throw new ErrorWithStatus({
                messages: MESSAGES_MESSAGES.MESSAGE_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            if (message.sender_id.toString() !== user_id) {
              throw new ErrorWithStatus({
                messages: MESSAGES_MESSAGES.NOT_YOUR_MESSAGE,
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            return true
          }
        }
      },
      content: {
        notEmpty: {
          errorMessage: MESSAGES_MESSAGES.CONTENT_IS_REQUIRED
        },
        isString: {
          errorMessage: 'Content must be a string'
        }
      }
    },
    ['params', 'body']
  )
)

export const deleteMessageValidator = validate(
  checkSchema(
    {
      message_id: {
        notEmpty: {
          errorMessage: MESSAGES_MESSAGES.MESSAGE_ID_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload
            const message = await databaseService.messages.findOne({
              _id: new ObjectId(value)
            })

            if (!message) {
              throw new ErrorWithStatus({
                messages: MESSAGES_MESSAGES.MESSAGE_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            if (message.sender_id.toString() !== user_id) {
              throw new ErrorWithStatus({
                messages: MESSAGES_MESSAGES.NOT_YOUR_MESSAGE,
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

export const getMessagesValidator = validate(
  checkSchema(
    {
      conversation_id: {
        notEmpty: {
          errorMessage: MESSAGES_MESSAGES.CONVERSATION_ID_REQUIRED
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

            const isParticipant =
              conversation.sender_id.toString() === user_id ||
              conversation.receiver_id.some((id) => id.toString() === user_id)

            if (!isParticipant) {
              throw new ErrorWithStatus({
                messages: MESSAGES_MESSAGES.NOT_CONVERSATION_PARTICIPANT,
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            return true
          }
        }
      }
    },
    ['query']
  )
)

export const markMessageReadValidator = validate(
  checkSchema(
    {
      conversation_id: {
        notEmpty: {
          errorMessage: MESSAGES_MESSAGES.CONVERSATION_ID_REQUIRED
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

            const isParticipant =
              conversation.sender_id.toString() === user_id ||
              conversation.receiver_id.some((id) => id.toString() === user_id)

            if (!isParticipant) {
              throw new ErrorWithStatus({
                messages: MESSAGES_MESSAGES.NOT_CONVERSATION_PARTICIPANT,
                status: HTTP_STATUS.FORBIDDEN
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

export const searchMessagesValidator = validate(
  checkSchema(
    {
      conversation_id: {
        notEmpty: {
          errorMessage: MESSAGES_MESSAGES.CONVERSATION_ID_REQUIRED
        }
      },
      search_term: {
        notEmpty: {
          errorMessage: MESSAGES_MESSAGES.SEARCH_TERM_REQUIRED
        },
        isString: {
          errorMessage: 'Search term must be a string'
        }
      }
    },
    ['query']
  )
)

// Pin Message Validators
export const pinMessageValidator = validate(
  checkSchema(
    {
      message_id: {
        notEmpty: {
          errorMessage: MESSAGES_MESSAGES.MESSAGE_ID_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload
            const message = await databaseService.messages.findOne({
              _id: new ObjectId(value)
            })

            if (!message) {
              throw new ErrorWithStatus({
                messages: MESSAGES_MESSAGES.MESSAGE_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            // Verify user is participant in conversation
            const conversation = await databaseService.conversations.findOne({
              _id: message.conversation_id
            })

            const isParticipant =
              conversation?.sender_id.toString() === user_id ||
              conversation?.receiver_id.some((id) => id.toString() === user_id)

            if (!isParticipant) {
              throw new ErrorWithStatus({
                messages: MESSAGES_MESSAGES.NOT_CONVERSATION_PARTICIPANT,
                status: HTTP_STATUS.FORBIDDEN
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

export const unpinMessageValidator = validate(
  checkSchema(
    {
      message_id: {
        notEmpty: {
          errorMessage: MESSAGES_MESSAGES.MESSAGE_ID_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload
            const message = await databaseService.messages.findOne({
              _id: new ObjectId(value)
            })

            if (!message) {
              throw new ErrorWithStatus({
                messages: MESSAGES_MESSAGES.MESSAGE_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            // Verify user is participant in conversation
            const conversation = await databaseService.conversations.findOne({
              _id: message.conversation_id
            })

            const isParticipant =
              conversation?.sender_id.toString() === user_id ||
              conversation?.receiver_id.some((id) => id.toString() === user_id)

            if (!isParticipant) {
              throw new ErrorWithStatus({
                messages: MESSAGES_MESSAGES.NOT_CONVERSATION_PARTICIPANT,
                status: HTTP_STATUS.FORBIDDEN
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

// Reaction Validators
export const addReactionValidator = validate(
  checkSchema(
    {
      message_id: {
        notEmpty: {
          errorMessage: MESSAGES_MESSAGES.MESSAGE_ID_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload
            const message = await databaseService.messages.findOne({
              _id: new ObjectId(value)
            })

            if (!message) {
              throw new ErrorWithStatus({
                messages: MESSAGES_MESSAGES.MESSAGE_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            // Verify user is participant in conversation
            const conversation = await databaseService.conversations.findOne({
              _id: message.conversation_id
            })

            const isParticipant =
              conversation?.sender_id.toString() === user_id ||
              conversation?.receiver_id.some((id) => id.toString() === user_id)

            if (!isParticipant) {
              throw new ErrorWithStatus({
                messages: MESSAGES_MESSAGES.NOT_CONVERSATION_PARTICIPANT,
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            return true
          }
        }
      },
      reaction_type: {
        notEmpty: {
          errorMessage: 'Reaction type is required'
        },
        isNumeric: {
          errorMessage: 'Reaction type must be a number'
        },
        custom: {
          options: (value: number) => {
            // Check if value is valid ReactionStatus enum value (0-5)
            if (!Object.values([0, 1, 2, 3, 4, 5]).includes(value)) {
              throw new Error('Invalid reaction type. Must be 0-5 (like, love, haha, wow, sad, angry)')
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const replyMessageValidator = validate(
  checkSchema(
    {
      conversation_id: {
        notEmpty: {
          errorMessage: MESSAGES_MESSAGES.CONVERSATION_ID_REQUIRED
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

            const isParticipant =
              conversation.sender_id.toString() === user_id ||
              conversation.receiver_id.some((id) => id.toString() === user_id)

            if (!isParticipant) {
              throw new ErrorWithStatus({
                messages: MESSAGES_MESSAGES.NOT_CONVERSATION_PARTICIPANT,
                status: HTTP_STATUS.FORBIDDEN
              })
            }

            return true
          }
        }
      },
      content: {
        notEmpty: {
          errorMessage: MESSAGES_MESSAGES.CONTENT_IS_REQUIRED
        },
        isString: {
          errorMessage: 'Content must be a string'
        }
      },
      reply_to: {
        notEmpty: {
          errorMessage: 'Reply to message ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { conversation_id } = req.body
            const replyMessage = await databaseService.messages.findOne({
              _id: new ObjectId(value),
              conversation_id: new ObjectId(conversation_id)
            })

            if (!replyMessage) {
              throw new Error('Reply message not found in this conversation')
            }
            return true
          }
        }
      },
      message_type: {
        optional: true,
        custom: {
          options: (value) => {
            if (value && !Object.values(MessageTypes).includes(value)) {
              throw new Error('Invalid message type')
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
