import { ObjectId } from 'mongodb'
import { ReactionStatus } from '~/constants/enum'

export interface MessageReactionType {
  _id?: ObjectId
  message_id: ObjectId
  user_id: ObjectId
  reaction_type: ReactionStatus
  created_at?: Date
}

export default class MessageReaction {
  _id?: ObjectId
  message_id: ObjectId
  user_id: ObjectId
  reaction_type: ReactionStatus
  created_at?: Date

  constructor({ _id, message_id, user_id, reaction_type, created_at }: MessageReactionType) {
    this._id = _id
    this.message_id = message_id
    this.user_id = user_id
    this.reaction_type = reaction_type
    this.created_at = created_at || new Date()
  }
}
