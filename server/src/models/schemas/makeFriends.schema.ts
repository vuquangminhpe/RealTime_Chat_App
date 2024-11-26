import { ObjectId } from 'mongodb'

interface MakeFriendType {
  _id: ObjectId
  user_id: ObjectId
  friend_id: ObjectId
  created_at?: Date
}

class MakeFriend {
  _id: ObjectId
  user_id: ObjectId
  friend_id: ObjectId
  created_at?: Date

  constructor({ _id, user_id, friend_id, created_at }: MakeFriendType) {
    this._id = _id
    this.user_id = user_id
    this.friend_id = friend_id
    this.created_at = created_at || new Date()
  }
}

export default MakeFriend
