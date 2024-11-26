import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enum'

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
  verify: UserVerifyStatus
}

export interface RegisterReqBody {
  email: string
  username: string
  password: string
}

export interface LoginReqBody {
  email: string
  password: string
}
export interface LogoutReqBody {
  refresh_token: string
}

export interface RefreshTokenReqBody {
  refresh_token: string
}
export interface EmailVerifyReqBody {
  email_verify_token: string
}
export interface ForgotReqBody {
  email: string
}
export interface VerifyForgotPasswordTokenReqBody {
  forgot_password_token: string
}
export interface ResetPassword {
  password: string
  forgot_password_token: string
}
export interface UpdateMyProfileReqBody {
  username: string
  avatar: string
  bio: string
  location: string
  website: string
}
