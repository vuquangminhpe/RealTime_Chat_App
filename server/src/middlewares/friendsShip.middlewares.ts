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
            const [friend_id, existing_friendship] = await Promise.all([
              databaseService.users.findOne({ _id: new ObjectId(value) }),
              databaseService.friendShip.findOne({ 
                friend_id: new ObjectId(value), 
                user_id: new ObjectId(user_id) 
              })
            ])
            
            if (!friend_id) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.FRIEND_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            
            // Kiểm tra relationship hiện tại
            if (existing_friendship) {
              if (existing_friendship.status === FriendsShipStatus.accepted) {
                throw new ErrorWithStatus({
                  messages: FRIENDS_SHIP_MESSAGES.ALREADY_FRIEND,
                  status: HTTP_STATUS.CONFLICT
                })
              }
              
              if (existing_friendship.status === FriendsShipStatus.pending) {
                throw new ErrorWithStatus({
                  messages: FRIENDS_SHIP_MESSAGES.FRIEND_REQUEST_ALREADY_SENT,
                  status: HTTP_STATUS.CONFLICT
                })
              }
              
              if (existing_friendship.status === FriendsShipStatus.blocked) {
                throw new ErrorWithStatus({
                  messages: FRIENDS_SHIP_MESSAGES.USER_IS_BLOCKED,
                  status: HTTP_STATUS.CONFLICT
                })
              }
              
              // Nếu status = rejected, cho phép gửi lời mời lại (không throw error)
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
      friendship_id: {
        notEmpty: {
          errorMessage: 'Friendship ID is required'
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload
            
            // Tìm friendship record theo ID
            const friendshipRecord = await databaseService.friendShip.findOne({
              _id: new ObjectId(value),
              $or: [
                { user_id: new ObjectId(user_id) },    // Người gửi request
                { friend_id: new ObjectId(user_id) }   // Người nhận request
              ]
            })

            if (!friendshipRecord) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.FRIEND_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            
            // Kiểm tra xem có phải là bạn bè đã accepted không
            if (friendshipRecord.status !== FriendsShipStatus.accepted) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.NOT_FRIEND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            
            // Kiểm tra user có bị ban không (tìm user còn lại)
            const otherUserId = friendshipRecord.user_id.toString() === user_id 
              ? friendshipRecord.friend_id 
              : friendshipRecord.user_id
              
            const isBanned = await databaseService.bannedUsers.findOne({ 
              banned_user_id: otherUserId 
            })
            
            if (isBanned) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.USER_IS_BANNED,
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

export const acceptFriendsValidator = validate(
  checkSchema(
    {
      friendship_id: {
        notEmpty: { errorMessage: FRIENDS_SHIP_MESSAGES.FRIEND_NOT_FOUND },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload
            
            // Tìm friendship record theo ID
            const friendshipRecord = await databaseService.friendShip.findOne({
              _id: new ObjectId(value),
              friend_id: new ObjectId(user_id) // Chỉ người nhận mới có thể accept
            })
            
            if (!friendshipRecord) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.FRIEND_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            
            if (friendshipRecord.status === FriendsShipStatus.accepted) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.YOU_HAVE_BEEN_CONNECTED_TO_THIS_USER,
                status: HTTP_STATUS.CONFLICT
              })
            }
            
            if (friendshipRecord.status !== FriendsShipStatus.pending) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.FRIEND_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            
            // Kiểm tra user có bị ban không
            const friend = await databaseService.users.findOne({
              _id: friendshipRecord.user_id
            })
            
            if (friend?.verify === UserVerifyStatus.Banned) {
              throw new ErrorWithStatus({
                messages: FRIENDS_SHIP_MESSAGES.USER_IS_BANNED,
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

export const rejectFriendsValidator = validate(
  checkSchema({
    friendship_id: {
      notEmpty: { errorMessage: FRIENDS_SHIP_MESSAGES.FRIEND_NOT_FOUND },
      custom: {
        options: async (value: string, { req }) => {
          const { user_id } = (req as Request).decode_authorization as TokenPayload
          
          // Tìm friendship record theo ID
          const friendshipRecord = await databaseService.friendShip.findOne({
            _id: new ObjectId(value),
            friend_id: new ObjectId(user_id) // Chỉ người nhận mới có thể reject
          })
          
          if (!friendshipRecord) {
            throw new ErrorWithStatus({
              messages: FRIENDS_SHIP_MESSAGES.FRIEND_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          
          if (friendshipRecord.status === FriendsShipStatus.rejected) {
            throw new ErrorWithStatus({
              messages: FRIENDS_SHIP_MESSAGES.YOU_HAVE_BEEN_REJECT_TO_THIS_USER,
              status: HTTP_STATUS.CONFLICT
            })
          }
          
          if (friendshipRecord.status === FriendsShipStatus.blocked) {
            throw new ErrorWithStatus({
              messages: FRIENDS_SHIP_MESSAGES.YOU_HAVE_BEEN_BLOCKED_TO_THIS_USER,
              status: HTTP_STATUS.CONFLICT
            })
          }
          
          if (friendshipRecord.status !== FriendsShipStatus.pending) {
            throw new ErrorWithStatus({
              messages: FRIENDS_SHIP_MESSAGES.FRIEND_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          
          return true
        }
      }
    }
  })
)

export const searchFriendsValidator = validate(
  checkSchema({
    search: {
      notEmpty: {
        errorMessage: FRIENDS_SHIP_MESSAGES.SEARCH_IS_REQUIRED
      }
    }
  })
)

export const searchUsersValidator = validate(
  checkSchema({
    search: {
      notEmpty: {
        errorMessage: FRIENDS_SHIP_MESSAGES.SEARCH_IS_REQUIRED
      }
    }
  })
)

export const cancelFriendsRequestValidator = validate(
  checkSchema({
    cancel_request_id: {
      notEmpty: {
        errorMessage: FRIENDS_SHIP_MESSAGES.FRIEND_NOT_FOUND
      },
      custom: {
        options: async (value: string, { req }) => {
          const { user_id } = (req as Request).decode_authorization as TokenPayload
          
          // Kiểm tra xem friendship record có tồn tại không
          const friendshipRecord = await databaseService.friendShip.findOne({
            _id: new ObjectId(value),
            user_id: new ObjectId(user_id) // Chỉ cho phép người gửi request cancel
          })
          
          if (!friendshipRecord) {
            throw new ErrorWithStatus({
              messages: FRIENDS_SHIP_MESSAGES.FRIEND_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          
          if (friendshipRecord.status !== FriendsShipStatus.pending) {
            throw new ErrorWithStatus({
              messages: FRIENDS_SHIP_MESSAGES.YOU_CAN_NOT_CANCEL_TO_THIS_USER,
              status: HTTP_STATUS.CONFLICT
            })
          }
          
          return true
        }
      }
    }
  })
)
