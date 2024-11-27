import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { MAKE_FRIENDS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'
import { Request } from 'express'
import { TokenPayload } from '~/models/request/User.request'
export const addFriendsValidator = validate(
  checkSchema({
    friend_id: {
      notEmpty: {
        errorMessage: 'Friend ID is required'
      },
      custom: {
        options: async (value: string, { req }) => {
          const { user_id } = (req as Request).decode_authorization as TokenPayload
          const [friend_id, make_friend_id] = await Promise.all([
            databaseService.users.findOne({ _id: new ObjectId(value) }),
            databaseService.makeFriend.findOne({ friend_id: new ObjectId(value), user_id: new ObjectId(user_id) })
          ])
          if (!friend_id) {
            throw new ErrorWithStatus({
              messages: MAKE_FRIENDS_MESSAGES.FRIEND_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          if (make_friend_id) {
            throw new ErrorWithStatus({
              messages: MAKE_FRIENDS_MESSAGES.ALREADY_FRIEND,
              status: HTTP_STATUS.CONFLICT
            })
          }
          if (user_id === friend_id._id.toString()) {
            throw new ErrorWithStatus({
              messages: MAKE_FRIENDS_MESSAGES.CANNOT_ADD_YOURSELF,
              status: HTTP_STATUS.CONFLICT
            })
          }
          req.friend_id = friend_id
          return true
        }
      }
    }
  })
)

export const unFriendsValidator = validate(
  checkSchema({
    friend_id: {
      notEmpty: {
        errorMessage: 'Friend ID is required'
      },
      custom: {
        options: async (value: string, { req }) => {
          const { user_id } = (req as Request).decode_authorization as TokenPayload
          const make_friend_id = await databaseService.makeFriend.findOne({
            friend_id: new ObjectId(value),
            user_id: new ObjectId(user_id)
          })
          console.log(value, make_friend_id)

          if (!make_friend_id) {
            throw new ErrorWithStatus({
              messages: MAKE_FRIENDS_MESSAGES.NOT_FRIEND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          req.make_friend_id = make_friend_id
          return true
        }
      }
    }
  })
)
