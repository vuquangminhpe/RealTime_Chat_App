import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { BANNED_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/request/User.request'
import { validate } from '~/utils/validation'
import { Request } from 'express'
import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'
export const bannedUserValidator = validate(
  checkSchema(
    {
      banned_user_id: {
        isString: true,
        notEmpty: {
          errorMessage: BANNED_MESSAGES.BANNED_USER_ID_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload
            if (value === user_id) {
              throw new ErrorWithStatus({
                messages: BANNED_MESSAGES.CANNOT_BAN_YOURSELF,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const user = await databaseService.users.findOne({ _id: new ObjectId(value) })
            const isBanned = await databaseService.bannedUsers.findOne({ banned_user_id: new ObjectId(value) })

            if (!user) {
              throw new ErrorWithStatus({
                messages: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            if (isBanned) {
              throw new ErrorWithStatus({
                messages: BANNED_MESSAGES.USER_HAS_BEEN_BANNED,
                status: HTTP_STATUS.BAD_REQUEST
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

export const unBannedUserValidator = validate(
  checkSchema(
    {
      un_banned_user_id: {
        isString: true,
        notEmpty: {
          errorMessage: BANNED_MESSAGES.UN_BANNED_USER_ID_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload
            const user = await databaseService.users.findOne({ _id: new ObjectId(value) })
            const isUnBanned = await databaseService.bannedUsers.findOne({ banned_user_id: new ObjectId(value) })
            if (!user) {
              throw new ErrorWithStatus({
                messages: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            if (value === user_id) {
              throw new ErrorWithStatus({
                messages: BANNED_MESSAGES.CANNOT_UN_BAN_YOURSELF,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            if (isUnBanned) {
              throw new ErrorWithStatus({
                messages: BANNED_MESSAGES.USER_HAS_BEEN_UN_BANNED,
                status: HTTP_STATUS.BAD_REQUEST
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
