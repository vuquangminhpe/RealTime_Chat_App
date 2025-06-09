import { checkSchema } from 'express-validator'
import { ReactionStatus } from '~/constants/enum'
import { REACTIONS_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const addReactionValidator = validate(
  checkSchema(
    {
      target_id: {
        notEmpty: {
          errorMessage: REACTIONS_MESSAGES.TARGET_ID_REQUIRED
        },
        isString: {
          errorMessage: REACTIONS_MESSAGES.TARGET_ID_MUST_BE_STRING
        }
      },
      target_type: {
        notEmpty: {
          errorMessage: REACTIONS_MESSAGES.TARGET_TYPE_REQUIRED
        },
        custom: {
          options: (value) => {
            const validTypes = ['story', 'message', 'comment']
            if (!validTypes.includes(value)) {
              throw new Error(REACTIONS_MESSAGES.INVALID_TARGET_TYPE)
            }
            return true
          }
        }
      },
      reaction_type: {
        notEmpty: {
          errorMessage: REACTIONS_MESSAGES.REACTION_TYPE_REQUIRED
        },
        custom: {
          options: (value) => {
            if (!Object.values(ReactionStatus).includes(value)) {
              throw new Error(REACTIONS_MESSAGES.INVALID_REACTION_TYPE)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const removeReactionValidator = validate(
  checkSchema(
    {
      target_id: {
        notEmpty: {
          errorMessage: REACTIONS_MESSAGES.TARGET_ID_REQUIRED
        },
        isString: {
          errorMessage: REACTIONS_MESSAGES.TARGET_ID_MUST_BE_STRING
        }
      },
      target_type: {
        notEmpty: {
          errorMessage: REACTIONS_MESSAGES.TARGET_TYPE_REQUIRED
        },
        custom: {
          options: (value) => {
            const validTypes = ['story', 'message', 'comment']
            if (!validTypes.includes(value)) {
              throw new Error(REACTIONS_MESSAGES.INVALID_TARGET_TYPE)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const getReactionsValidator = validate(
  checkSchema(
    {
      target_id: {
        notEmpty: {
          errorMessage: REACTIONS_MESSAGES.TARGET_ID_REQUIRED
        },
        isString: {
          errorMessage: REACTIONS_MESSAGES.TARGET_ID_MUST_BE_STRING
        }
      },
      target_type: {
        notEmpty: {
          errorMessage: REACTIONS_MESSAGES.TARGET_TYPE_REQUIRED
        },
        custom: {
          options: (value) => {
            const validTypes = ['story', 'message', 'comment']
            if (!validTypes.includes(value)) {
              throw new Error(REACTIONS_MESSAGES.INVALID_TARGET_TYPE)
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
