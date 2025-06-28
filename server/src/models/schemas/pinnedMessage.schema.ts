import { ObjectId } from 'mongodb'

export interface PinnedMessageType {
  _id?: ObjectId
  conversation_id: ObjectId
  message_id: ObjectId
  pinned_by: ObjectId
  created_at?: Date
}

export default class PinnedMessage {
  _id?: ObjectId
  conversation_id: ObjectId
  message_id: ObjectId
  pinned_by: ObjectId
  created_at?: Date

  constructor({ _id, conversation_id, message_id, pinned_by, created_at }: PinnedMessageType) {
    this._id = _id
    this.conversation_id = conversation_id
    this.message_id = message_id
    this.pinned_by = pinned_by
    this.created_at = created_at || new Date()
  }
}
