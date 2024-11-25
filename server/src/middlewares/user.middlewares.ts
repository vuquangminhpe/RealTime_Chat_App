import { checkSchema } from 'express-validator'
import { USERS_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { verifyAccessToken } from '~/utils/common'
import { validate } from '~/utils/validation'
import { Request } from 'express'
import { TokenPayload } from '~/models/request/User.request'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from '~/utils/jwt'
import { envConfig } from '~/constants/config'
import HTTP_STATUS from '~/constants/httpStatus'
import { JsonWebTokenError } from 'jsonwebtoken'
import _ from 'lodash'
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

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const access_token = value.split(' ')[1]
            return await verifyAccessToken(access_token, req as Request)
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            try {
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOnPublicKey: envConfig.secretOnPublicKey_Refresh as string }),
                databaseService.refreshToken.findOne({ refresh_token: value })
              ])
              if (!refresh_token) {
                throw new ErrorWithStatus({
                  messages: USERS_MESSAGES.REFRESH_TOKEN_IS_VALID,
                  status: HTTP_STATUS.NOT_FOUND
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token as TokenPayload
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  messages: _.capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyEmailTokenValidator = validate(
  checkSchema({
    email_verify_token: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED
      },
      custom: {
        options: async (value, { req }) => {
          console.log(value)

          const user = await databaseService.users.findOne({ email_verify_token: value })
          if (!user) {
            throw new ErrorWithStatus({
              messages: USERS_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          if (user.email_verify_token === '') {
            throw new ErrorWithStatus({
              messages: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED,
              status: HTTP_STATUS.NO_CONTENT
            })
          }
          return true
        }
      }
    }
  })
)
