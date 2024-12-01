import { ObjectId } from 'mongodb'
import { FriendsShipStatus, statusActivityType } from '~/constants/enum'

interface FriendsShipType {
  _id: ObjectId
  user_id: ObjectId
  friend_id: ObjectId
  created_at?: Date
  status?: FriendsShipStatus
  activeStatus?: statusActivityType
}

class FriendsShip {
  _id: ObjectId
  user_id: ObjectId
  friend_id: ObjectId
  created_at?: Date
  status?: FriendsShipStatus
  activeStatus?: statusActivityType
  constructor({ _id, user_id, friend_id, created_at, status, activeStatus }: FriendsShipType) {
    this._id = _id
    this.user_id = user_id
    this.friend_id = friend_id
    this.created_at = created_at || new Date()
    this.status = status || FriendsShipStatus.pending
    this.activeStatus = activeStatus || statusActivityType.offline
  }
}

export default FriendsShip
