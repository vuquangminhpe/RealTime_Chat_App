import { ObjectId } from 'mongodb'
import { Media } from '~/models/Other'

export enum MessageTypes {
  Text = 'text',
  Image = 'image',
  Video = 'video',
  File = 'file',
  Audio = 'audio'
}

export enum MessageStatus {
  Sent = 'sent',
  Delivered = 'delivered',
  Read = 'read'
}

interface MessageType {
  _id?: ObjectId
  conversation_id: ObjectId
  sender_id: ObjectId
  content: string
  message_type: MessageTypes
  medias?: Media[]
  reply_to?: ObjectId
  edited?: boolean
  edited_at?: Date
  status: MessageStatus
  created_at?: Date
  updated_at?: Date
}

export default class Message {
  _id?: ObjectId
  conversation_id: ObjectId
  sender_id: ObjectId
  content: string
  message_type: MessageTypes
  medias?: Media[]
  reply_to?: ObjectId
  edited?: boolean
  edited_at?: Date
  status: MessageStatus
  created_at?: Date
  updated_at?: Date

  constructor({
    _id,
    conversation_id,
    sender_id,
    content,
    message_type,
    medias,
    reply_to,
    edited,
    edited_at,
    status,
    created_at,
    updated_at
  }: MessageType) {
    const date = new Date()
    this._id = _id
    this.conversation_id = conversation_id
    this.sender_id = sender_id
    this.content = content
    this.message_type = message_type
    this.medias = medias || []
    this.reply_to = reply_to
    this.edited = edited || false
    this.edited_at = edited_at
    this.status = status || MessageStatus.Sent
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
