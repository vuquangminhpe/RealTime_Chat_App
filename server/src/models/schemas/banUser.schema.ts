import { ObjectId } from 'mongodb'

interface BanUserType {
  _id: ObjectId
  user_id: ObjectId
  banned_user_id: ObjectId
  created_at?: Date
}

class BanUser {
  _id: ObjectId
  user_id: ObjectId
  banned_user_id: ObjectId
  created_at?: Date

  constructor({ _id, user_id, banned_user_id, created_at }: BanUserType) {
    this._id = _id
    this.user_id = user_id
    this.banned_user_id = banned_user_id
    this.created_at = created_at || new Date()
  }
}

export default BanUser
