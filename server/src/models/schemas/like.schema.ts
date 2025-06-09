import { ObjectId } from 'mongodb'

export enum LikeTargetTypes {
  Story = 'story',
  Message = 'message',
  User = 'user'
}

export interface LikeType {
  _id?: ObjectId
  user_id: ObjectId
  target_id: string
  target_type: LikeTargetTypes
  created_at?: Date
}

export default class Like {
  _id?: ObjectId
  user_id: ObjectId
  target_id: string
  target_type: LikeTargetTypes
  created_at?: Date

  constructor({ _id, user_id, target_id, target_type, created_at }: LikeType) {
    this._id = _id
    this.user_id = user_id
    this.target_id = target_id
    this.target_type = target_type
    this.created_at = created_at || new Date()
  }
}
