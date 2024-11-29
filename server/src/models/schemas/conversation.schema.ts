import { ObjectId } from 'mongodb'
import { ConversationsStatus } from '~/constants/enum'

interface ConversationsType {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId[]
  type: ConversationsStatus
  content: string
  created_at?: Date
  update_at?: Date
}

export default class Conversations {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId[]
  type: ConversationsStatus
  content: string
  created_at?: Date
  update_at?: Date

  constructor({ sender_id, receiver_id, type, content, _id, created_at, update_at }: ConversationsType) {
    const date = new Date()
    this._id = _id
    this.sender_id = sender_id
    this.receiver_id = receiver_id
    this.type = type
    this.content = content
    this.created_at = created_at || date
    this.update_at = update_at || date
  }
}
