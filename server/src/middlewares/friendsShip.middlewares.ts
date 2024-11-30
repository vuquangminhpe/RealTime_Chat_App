import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { FRIENDS_SHIP_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'
import { Request } from 'express'
import { TokenPayload } from '~/models/request/User.request'
import { FriendsShipStatus, UserVerifyStatus } from '~/constants/enum'
export const addFriendsValidator = validate(
  checkSchema(
    {
      friend_id: {
        notEmpty: {
          errorMessage: 'Friend ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload
            const isBanned = await databaseService.bannedUsers.findOne({ banned_user_id: new ObjectId(value) })
            if (isBanned) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.USER_IS_BANNED,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const [friend_id, make_friend_id] = await Promise.all([
              databaseService.users.findOne({ _id: new ObjectId(value) }),
              databaseService.friendShip.findOne({ friend_id: new ObjectId(value), user_id: new ObjectId(user_id) })
            ])
            if (!friend_id) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.FRIEND_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            if (make_friend_id) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.ALREADY_FRIEND,
                status: HTTP_STATUS.CONFLICT
              })
            }
            if (user_id === friend_id._id.toString()) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.CANNOT_ADD_YOURSELF,
                status: HTTP_STATUS.CONFLICT
              })
            }
            req.friend_id = friend_id
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const unFriendsValidator = validate(
  checkSchema(
    {
      friend_id: {
        notEmpty: {
          errorMessage: 'Friend ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload
            const isBanned = await databaseService.bannedUsers.findOne({ banned_user_id: new ObjectId(value) })
            if (isBanned) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.USER_IS_BANNED,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const make_friend_id = await databaseService.friendShip.findOne({
              friend_id: new ObjectId(value),
              user_id: new ObjectId(user_id)
            })
            console.log(value, make_friend_id)

            if (!make_friend_id) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.NOT_FRIEND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            req.make_friend_id = make_friend_id
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const acceptFriendsValidator = validate(
  checkSchema(
    {
      accept_friend_id: {
        notEmpty: { errorMessage: FRIENDS_SHIP_MESSAGES.FRIEND_NOT_FOUND },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload
            const friend_id = await databaseService.friendShip.findOne({
              friend_id: new ObjectId(user_id),
              user_id: new ObjectId(value)
            })
            if (!friend_id) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.FRIEND_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            if (friend_id.status === FriendsShipStatus.accepted) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.YOU_HAVE_BEEN_CONNECTED_TO_THIS_USER,
                status: HTTP_STATUS.CONFLICT
              })
            }
            const friend = await databaseService.users.findOne({
              _id: new ObjectId(value)
            })
            if (friend?.verify === UserVerifyStatus.Banned) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.USER_IS_BANNED,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            req.friend_id = friend_id
            return true
          }
        }
      }
    },
    ['params']
  )
)
