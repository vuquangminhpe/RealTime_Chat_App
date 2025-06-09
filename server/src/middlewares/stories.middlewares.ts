import { checkSchema } from 'express-validator'
import { StoriesDataType } from '~/constants/enum'
import { STORIES_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'
import databaseService from '~/services/database.services'
import { TokenPayload } from '~/models/request/User.request'
import { Request } from 'express'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'

export const addStoryValidator = validate(
  checkSchema(
    {
      content: {
        notEmpty: {
          errorMessage: STORIES_MESSAGES.CONTENT_IS_REQUIRED
        },
        custom: {
          options: (value) => {
            if (!Object.values(StoriesDataType).includes(value)) {
              throw new Error(STORIES_MESSAGES.INVALID_CONTENT_TYPE)
            }
            return true
          }
        }
      },
      text: {
        optional: true,
        isString: {
          errorMessage: STORIES_MESSAGES.TEXT_MUST_BE_STRING
        },
        isLength: {
          options: {
            max: 500
          },
          errorMessage: STORIES_MESSAGES.TEXT_TOO_LONG
        }
      }
    },
    ['body']
  )
)

export const deleteStoryValidator = validate(
  checkSchema(
    {
      story_id: {
        notEmpty: {
          errorMessage: STORIES_MESSAGES.STORY_ID_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload
            const story = await databaseService.stories.findOne({ _id: value })

            if (!story) {
              throw new ErrorWithStatus({
                messages: STORIES_MESSAGES.STORY_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            if (story.user_id !== user_id) {
              throw new ErrorWithStatus({
                messages: STORIES_MESSAGES.NOT_YOUR_STORY,
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
