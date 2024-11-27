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
            if (!user) {
              throw new ErrorWithStatus({
                messages: USERS_MESSAGES.USER_NOT_FOUND,
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
