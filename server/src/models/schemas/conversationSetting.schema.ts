import { ObjectId } from 'mongodb'

interface ConversationSettingsType {
  _id?: ObjectId
  user_id: ObjectId
  conversation_id: ObjectId
  pinned?: boolean
  pinned_at?: Date
  muted?: boolean
  muted_until?: Date
  archived?: boolean
  archived_at?: Date
  notifications_enabled?: boolean
  created_at?: Date
  updated_at?: Date
}

export default class ConversationSettings {
  _id?: ObjectId
  user_id: ObjectId
  conversation_id: ObjectId
  pinned?: boolean
  pinned_at?: Date
  muted?: boolean
  muted_until?: Date
  archived?: boolean
  archived_at?: Date
  notifications_enabled?: boolean
  created_at?: Date
  updated_at?: Date

  constructor({
    _id,
    user_id,
    conversation_id,
    pinned,
    pinned_at,
    muted,
    muted_until,
    archived,
    archived_at,
    notifications_enabled,
    created_at,
    updated_at
  }: ConversationSettingsType) {
    const date = new Date()
    this._id = _id
    this.user_id = user_id
    this.conversation_id = conversation_id
    this.pinned = pinned || false
    this.pinned_at = pinned_at
    this.muted = muted || false
    this.muted_until = muted_until
    this.archived = archived || false
    this.archived_at = archived_at
    this.notifications_enabled = notifications_enabled !== false // Default true
    this.created_at = created_at || date
    this.updated_at = updated_at || date
  }
}
