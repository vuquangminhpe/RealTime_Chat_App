import { envConfig } from '~/constants/config'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { RegisterReqBody } from '~/models/request/User.request'
import { signToken, verifyToken } from '~/utils/jwt'
import databaseService from './database.services'
import User from '~/models/schemas/users.schema'
import { ObjectId } from 'mongodb'
import { hashPassword } from '~/utils/crypto'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import RefreshToken from '~/models/schemas/refreshToken.schema'

class UserServices {
  async signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        verify,
        user_type: TokenType.AccessToken
      },
      privateKey: envConfig.privateKey_access_token as string,
      optional: {
        expiresIn: envConfig.expiresIn_access_token
      }
    })
  }

  async signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        verify,
        user_type: TokenType.AccessToken
      },
      privateKey: envConfig.privateKey_refresh_token as string,
      optional: {
        expiresIn: envConfig.expiresIn_access_token
      }
    })
  }

  async signEmailToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        verify,
        user_type: TokenType.AccessToken
      },
      privateKey: envConfig.secretOnPublicKey_Email as string,
      optional: {
        expiresIn: envConfig.expiresIn_access_token
      }
    })
  }
  async signAccessTokenAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    const user = databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        password: hashPassword(payload.password),
        email_verify_token: email_verify_token as string
      })
    )
    const result = databaseService.users.findOne(
      { _id: new ObjectId((await user).insertedId) },
      {
        projection: {
          email: 1,
          email_verify_token: 1,
          _id: 1,
          username: 1
        }
      }
    )
    return result
  }
  async login({ email, password }: { email: string; password: string }) {
    const user = await databaseService.users.findOne({ email, password: hashPassword(password) })
    if (!user) {
      throw new ErrorWithStatus({
        messages: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken({
      user_id: String(user._id),
      verify: user.verify as UserVerifyStatus
    })
    const _id = new ObjectId()
    await databaseService.refreshToken.insertOne(
      new RefreshToken({ _id: _id, user_id: new ObjectId(user._id), refresh_token: refresh_token })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async logout(refresh_token: string) {
    const refreshToken = await databaseService.refreshToken.deleteOne({ refresh_token })

    return refreshToken
  }
  async refreshToken({
    refresh_token,
    user_id,
    verify
  }: {
    refresh_token: string
    user_id: string
    verify: UserVerifyStatus
  }) {
    const newRefreshToken = await this.signRefreshToken({
      user_id: String(user_id),
      verify
    })
    await databaseService.refreshToken.deleteOne({ refresh_token })
    const _id = new ObjectId()
    await databaseService.refreshToken.insertOne(
      new RefreshToken({ _id, user_id: new ObjectId(user_id), refresh_token: newRefreshToken })
    )

    return newRefreshToken
  }
}

const userServices = new UserServices()
export default userServices
