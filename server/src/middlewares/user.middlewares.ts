import { checkSchema } from 'express-validator'
import { USERS_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const registerValidator = validate(
  checkSchema({
    email: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: USERS_MESSAGES.INCORRECT_EMAIL_FORMAT
      },
      custom: {
        options: async (value, { req }) => {
          if (!value) return true
          const result = await databaseService.users.findOne({ email: value })
          if (result) {
            throw new Error(USERS_MESSAGES.EMAIL_IS_ALREADY_EXISTS)
          }
          return true
        }
      }
    },
    username: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGES.NAME_MUST_BE_CONTAIN_IS_STRING
      },
      isLength: {
        options: {
          min: 6,
          max: 50
        },
        errorMessage: USERS_MESSAGES.NAME_MUST_BE_CONTAIN_5_TO_60_CHARACTER
      },
      custom: {
        options: async (value, { req }) => {
          if (!value) return true
          const result = await databaseService.users.findOne({ username: value })
          if (result) {
            throw new Error(USERS_MESSAGES.USERNAME_IS_ALREADY_EXISTS)
          }
          return true
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_CONTAIN_IS_STRING
      },
      isLength: {
        options: {
          min: 6,
          max: 50
        },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_CONTAIN_5_TO_60_CHARACTER
      },
      isStrongPassword: {
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_AT_LEAST_1_LETTER_1_NUMBER_AND_1_SPECIAL_CHARACTERS
      }
    },
    confirm_password: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_CONTAIN_IS_STRING
      },
      isLength: {
        options: {
          min: 6,
          max: 50
        },
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_CONTAIN_5_TO_60_CHARACTER
      },
      isStrongPassword: {
        errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_AT_LEAST_1_LETTER_1_NUMBER_AND_1_SPECIAL_CHARACTERS
      },
      custom: {
        options: (value, { req }) => {
          if (!value) return true
          if (value !== req.body.password) {
            throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_PASSWORD)
          }
          return true
        }
      }
    }
  })
)

export const loginValidator = validate(
  checkSchema({
    email: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: USERS_MESSAGES.INCORRECT_EMAIL_FORMAT
      }
    },
    password: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_CONTAIN_IS_STRING
      },
      isLength: {
        options: {
          min: 5,
          max: 50
        },
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_CONTAIN_5_TO_60_CHARACTER
      },
      isStrongPassword: {
        errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_AT_LEAST_1_LETTER_1_NUMBER_AND_1_SPECIAL_CHARACTERS
      }
    }
  })
)
