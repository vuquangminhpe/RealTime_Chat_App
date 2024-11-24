import { ObjectId } from 'mongodb'

export interface RefreshTokenType {
  _id: ObjectId
  refresh_token: string
  user_id: ObjectId
  created_at?: Date
}

class RefreshToken {
  _id: ObjectId
  refresh_token: string
  user_id: ObjectId
  created_at?: Date
  constructor({ _id, refresh_token, user_id, created_at }: RefreshTokenType) {
    this._id = _id
    this.refresh_token = refresh_token
    this.user_id = user_id
    this.created_at = created_at || new Date()
  }
}

export default RefreshToken
