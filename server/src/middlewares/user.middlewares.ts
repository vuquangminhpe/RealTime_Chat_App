import { checkSchema } from 'express-validator'
import { USERS_MESSAGES } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { verifyAccessToken } from '~/utils/common'
import { validate } from '~/utils/validation'
import { NextFunction, Request, RequestHandler } from 'express'
import { TokenPayload } from '~/models/request/User.request'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from '~/utils/jwt'
import { envConfig } from '~/constants/config'
import HTTP_STATUS from '~/constants/httpStatus'
import { JsonWebTokenError } from 'jsonwebtoken'
import _ from 'lodash'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
export const registerValidator = validate(
  checkSchema(
    {
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
      },
      date_of_birth: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_IS_REQUIRED
        },
        isISO8601: {
          errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_IN_ISO_8601_FORMAT
        },
        custom: {
          options: (value) => {
            const birthDate = new Date(value)
            const currentDate = new Date()
            const ageDiff = currentDate.getFullYear() - birthDate.getFullYear()
            if (ageDiff < 18) {
              throw new Error(USERS_MESSAGES.YOU_ARE_NOT_ELIGIBLE_FOR_REGISTER)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const loginValidator = validate(
  checkSchema(
    {
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
    },
    ['body']
  )
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
            const result = await verifyAccessToken(access_token, req as Request)
            console.log(result)
            return result
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
  checkSchema(
    {
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
    },
    ['body']
  )
)

export const forgotPasswordTokenValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.INCORRECT_EMAIL_FORMAT
        },
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({ email: value })
            if (!user) {
              throw new ErrorWithStatus({
                messages: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            ;(req as Request).user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({ forgot_password_token: value })
            if (!user) {
              throw new ErrorWithStatus({
                messages: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_INVALID,
                status: HTTP_STATUS.NOT_FOUND
              })
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const resetPasswordValidator = checkSchema(
  {
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
  },
  ['body']
)

export const verifyUserValidator: RequestHandler = async (req: Request, res, next: NextFunction) => {
  const { user_id } = (req.decode_authorization as TokenPayload) || {}
  const result = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (result?.verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        messages: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}

export const updateMyProfileValidator = validate(
  checkSchema(
    {
      username: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.USERNAME_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_CONTAIN_IS_STRING
        },
        isLength: {
          options: {
            min: 0,
            max: 60
          },
          errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_CONTAIN_5_TO_60_CHARACTER
        },
        custom: {
          options: async (value, { req }) => {
            const { user_id } = (req as Request).decode_authorization as TokenPayload
            const user = await databaseService.users.findOne({ _id: new ObjectId(user_id), username: value as string })
            if (user) {
              throw new ErrorWithStatus({
                messages: USERS_MESSAGES.USERNAME_ALREADY_EXISTS,
                status: HTTP_STATUS.CONFLICT
              })
            }
            return true
          }
        }
      },
      bio: {
        isString: {
          errorMessage: USERS_MESSAGES.BIO_MUST_BE_CONTAIN_IS_STRING
        },
        isLength: {
          options: {
            min: 0,
            max: 500
          },
          errorMessage: USERS_MESSAGES.BIO_MUST_BE_CONTAIN_5_TO_500_CHARACTER
        }
      },
      location: {
        isString: {
          errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_CONTAIN_IS_STRING
        },
        isLength: {
          options: {
            min: 0,
            max: 100
          },
          errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_CONTAIN_5_TO_100_CHARACTER
        }
      },
      website: {
        isLength: {
          options: {
            min: 0,
            max: 255
          },
          errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_CONTAIN_5_TO_255_CHARACTER
        }
      }
    },
    ['body']
  )
)
