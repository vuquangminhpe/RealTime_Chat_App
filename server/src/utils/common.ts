import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { verifyToken } from './jwt'
import { envConfig } from '~/constants/config'
import { Request } from 'express'
import _ from 'lodash'
import { JsonWebTokenError } from 'jsonwebtoken'
export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((value) => typeof value === 'number') as number[]
}

export const verifyAccessToken = async (access_tokens: string, request: Request) => {
  if (!access_tokens) {
    throw new ErrorWithStatus({
      messages: USERS_MESSAGES.ACCESS_TOKEN_REQUIRED,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }

  try {
    const decode_authorization = await verifyToken({
      token: access_tokens,
      secretOnPublicKey: envConfig.privateKey_access_token as string
    })

    if (request) {
      ;(request as Request).decode_authorization = decode_authorization
      return true
    }

    return decode_authorization
  } catch (error) {
    throw new ErrorWithStatus({
      messages: _.capitalize((error as JsonWebTokenError).message),
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
}
