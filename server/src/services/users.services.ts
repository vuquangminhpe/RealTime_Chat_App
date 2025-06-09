import { envConfig } from '~/constants/config'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { RegisterReqBody, UpdateMyProfileReqBody } from '~/models/request/User.request'
import { signToken } from '~/utils/jwt'
import databaseService from './database.services'
import User from '~/models/schemas/Users.schema'
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
        expiresIn: envConfig.expiresIn_email_token
      }
    })
  }
  async signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        verify,
        user_type: TokenType.AccessToken
      },
      privateKey: envConfig.secretOnPublicKey_Forgot as string,
      optional: {
        expiresIn: envConfig.expiresIn_forgot_token
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
    const user = await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        password: hashPassword(payload.password),
        email_verify_token: email_verify_token as string,
        forgot_password_token: '',
        date_of_birth: new Date(payload.date_of_birth)
      })
    )
    const result = await databaseService.users.findOne(
      { _id: new ObjectId(user.insertedId) },
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
  async verifyEmail(email_verify_token: string) {
    await databaseService.users.updateOne(
      { email_verify_token },
      {
        $set: { verify: UserVerifyStatus.Verified, email_verify_token: '' },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }
  async recentEmailVerifyToken(user_id: string) {
    const [user, new_email_verify_token] = await Promise.all([
      databaseService.users.findOne({ _id: new ObjectId(user_id) }),
      this.signEmailToken({ user_id, verify: UserVerifyStatus.Unverified })
    ])
    if (user?.email_verify_token === '') {
      throw new ErrorWithStatus({
        messages: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED,
        status: HTTP_STATUS.NO_CONTENT
      })
    }
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token: new_email_verify_token as string
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return new_email_verify_token
  }
  async forgotPassword(email: string) {
    const user = await databaseService.users.findOne({ email })
    if (!user) {
      throw new ErrorWithStatus({
        messages: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    const new_forgot_password_token = await this.signForgotPasswordToken({
      user_id: String(user._id),
      verify: user?.verify as UserVerifyStatus
    })
    await databaseService.users.updateOne(
      { _id: new ObjectId(user._id) },
      {
        $set: {
          forgot_password_token: new_forgot_password_token as string
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return new_forgot_password_token
  }
  async verifyForgotPassword(forgot_password_token: string) {
    const user = await databaseService.users.findOne({ forgot_password_token })
    return user
  }
  async resetPassword(password: string, forgot_password_token: string) {
    const user = await databaseService.users.findOneAndUpdate(
      { forgot_password_token },
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: ''
        },
        $currentDate: {
          updated_at: true
        }
      }
    )

    return user
  }
  async getProfile(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      { projection: { email: 1, username: 1, _id: 1, verify: 1, avatar: 1 } }
    )
    return user
  }
  async updateProfile(user_id: string, payload: UpdateMyProfileReqBody) {
    const user = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: { ...payload },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return user
  }
  async getUser(username: string) {
    const user = await databaseService.users.findOne(
      { username: username },
      { projection: { email: 1, username: 1, avatar: 1, bio: 1, location: 1, website: 1 } }
    )
    if (user?.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        messages: USERS_MESSAGES.USER_BANNED_CANT_NOT_GET_DATA,
        status: HTTP_STATUS.FORBIDDEN
      })
    }
    return user
  }
}

const userServices = new UserServices()
export default userServices
