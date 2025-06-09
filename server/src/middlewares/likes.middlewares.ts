import { checkSchema } from 'express-validator'
import { LikeTargetTypes } from '~/models/schemas/like.schema'
import { LIKES_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const likeValidator = validate(
  checkSchema(
    {
      target_id: {
        notEmpty: {
          errorMessage: LIKES_MESSAGES.TARGET_ID_REQUIRED
        },
        isString: {
          errorMessage: LIKES_MESSAGES.TARGET_ID_MUST_BE_STRING
        }
      },
      target_type: {
        notEmpty: {
          errorMessage: LIKES_MESSAGES.TARGET_TYPE_REQUIRED
        },
        custom: {
          options: (value) => {
            if (!Object.values(LikeTargetTypes).includes(value)) {
              throw new Error(LIKES_MESSAGES.INVALID_TARGET_TYPE)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const unlikeValidator = validate(
  checkSchema(
    {
      target_id: {
        notEmpty: {
          errorMessage: LIKES_MESSAGES.TARGET_ID_REQUIRED
        },
        isString: {
          errorMessage: LIKES_MESSAGES.TARGET_ID_MUST_BE_STRING
        }
      },
      target_type: {
        notEmpty: {
          errorMessage: LIKES_MESSAGES.TARGET_TYPE_REQUIRED
        },
        custom: {
          options: (value) => {
            if (!Object.values(LikeTargetTypes).includes(value)) {
              throw new Error(LIKES_MESSAGES.INVALID_TARGET_TYPE)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const getLikesValidator = validate(
  checkSchema(
    {
      target_id: {
        notEmpty: {
          errorMessage: LIKES_MESSAGES.TARGET_ID_REQUIRED
        },
        isString: {
          errorMessage: LIKES_MESSAGES.TARGET_ID_MUST_BE_STRING
        }
      },
      target_type: {
        notEmpty: {
          errorMessage: LIKES_MESSAGES.TARGET_TYPE_REQUIRED
        },
        custom: {
          options: (value) => {
            if (!Object.values(LikeTargetTypes).includes(value)) {
              throw new Error(LIKES_MESSAGES.INVALID_TARGET_TYPE)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)

export const checkLikeStatusValidator = validate(
  checkSchema(
    {
      target_id: {
        notEmpty: {
          errorMessage: LIKES_MESSAGES.TARGET_ID_REQUIRED
        },
        isString: {
          errorMessage: LIKES_MESSAGES.TARGET_ID_MUST_BE_STRING
        }
      },
      target_type: {
        notEmpty: {
          errorMessage: LIKES_MESSAGES.TARGET_TYPE_REQUIRED
        },
        custom: {
          options: (value) => {
            if (!Object.values(LikeTargetTypes).includes(value)) {
              throw new Error(LIKES_MESSAGES.INVALID_TARGET_TYPE)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
