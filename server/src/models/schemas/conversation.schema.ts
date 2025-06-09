import { ObjectId } from 'mongodb'
import { ConversationsStatus } from '~/constants/enum'

interface ConversationsType {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId[]
  type: ConversationsStatus
  content: string
  group_name?: string
  group_description?: string
  group_avatar?: string

  created_at?: Date
  update_at?: Date
}

export default class Conversations {
  _id?: ObjectId
  sender_id: ObjectId
  receiver_id: ObjectId[]
  type: ConversationsStatus
  content: string
  group_name?: string
  group_description?: string
  group_avatar?: string

  created_at?: Date
  update_at?: Date

  constructor({
    sender_id,
    receiver_id,
    type,
    content,
    group_name,
    group_description,
    group_avatar,
    _id,
    created_at,
    update_at
  }: ConversationsType) {
    const date = new Date()
    this._id = _id
    this.sender_id = sender_id
    this.receiver_id = receiver_id
    this.type = type
    this.content = content
    this.group_name = group_name
    this.group_description = group_description
    this.group_avatar = group_avatar
    this.created_at = created_at || date
    this.update_at = update_at || date
  }
}
