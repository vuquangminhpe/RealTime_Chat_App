import { ObjectId } from 'mongodb'
import { MakeFriendStatus } from '~/constants/enum'

interface MakeFriendType {
  _id: ObjectId
  user_id: ObjectId
  friend_id: ObjectId
  created_at?: Date
  status: MakeFriendStatus
}

class MakeFriend {
  _id: ObjectId
  user_id: ObjectId
  friend_id: ObjectId
  created_at?: Date
  status: MakeFriendStatus

  constructor({ _id, user_id, friend_id, created_at, status }: MakeFriendType) {
    this._id = _id
    this.user_id = user_id
    this.friend_id = friend_id
    this.created_at = created_at || new Date()
    this.status = status || MakeFriendStatus.pending
  }
}

export default MakeFriend
