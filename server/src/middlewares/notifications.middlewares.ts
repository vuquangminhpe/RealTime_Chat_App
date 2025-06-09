import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { validate } from '~/utils/validation'
import { NOTIFICATIONS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'

export const markNotificationReadValidator = validate(
  checkSchema(
    {
      notification_id: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                messages: NOTIFICATIONS_MESSAGES.INVALID_NOTIFICATION_ID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }

            const notification = await databaseService.notifications.findOne({
              _id: new ObjectId(value as string)
            })

            if (!notification) {
              throw new ErrorWithStatus({
                messages: NOTIFICATIONS_MESSAGES.NOTIFICATION_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            req.notification = notification
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const deleteNotificationValidator = validate(
  checkSchema(
    {
      notification_id: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                messages: NOTIFICATIONS_MESSAGES.INVALID_NOTIFICATION_ID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }

            const notification = await databaseService.notifications.findOne({
              _id: new ObjectId(value as string)
            })

            if (!notification) {
              throw new ErrorWithStatus({
                messages: NOTIFICATIONS_MESSAGES.NOTIFICATION_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            req.notification = notification
            return true
          }
        }
      }
    },
    ['params']
  )
)
