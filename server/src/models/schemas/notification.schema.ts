import { ObjectId } from 'mongodb'

export enum NotificationType {
  FriendRequest = 'friend_request',
  FriendAccepted = 'friend_accepted',
  MessageReceived = 'message_received',
  Mention = 'mention',
  Like = 'like',
  Reaction = 'reaction',
  GroupInvite = 'group_invite',
  GroupMemberAdded = 'group_member_added',
  GroupRoleChanged = 'group_role_changed',
  StoryReaction = 'story_reaction'
}

export enum NotificationStatus {
  Unread = 'unread',
  Read = 'read'
}

interface NotificationTypes {
  _id?: ObjectId
  recipient_id: ObjectId
  sender_id: ObjectId
  type: NotificationType
  title: string
  message: string
  data?: any
  target_id?: string
  target_type?: string
  status: NotificationStatus
  created_at?: Date
  read_at?: Date
}

export default class Notification {
  _id?: ObjectId
  recipient_id: ObjectId
  sender_id: ObjectId
  type: NotificationType
  title: string
  message: string
  data?: any
  target_id?: string
  target_type?: string
  status: NotificationStatus
  created_at?: Date
  read_at?: Date

  constructor({
    _id,
    recipient_id,
    sender_id,
    type,
    title,
    message,
    data,
    target_id,
    target_type,
    status,
    created_at,
    read_at
  }: NotificationTypes) {
    this._id = _id
    this.recipient_id = recipient_id
    this.sender_id = sender_id
    this.type = type
    this.title = title
    this.message = message
    this.data = data
    this.target_id = target_id
    this.target_type = target_type
    this.status = status || NotificationStatus.Unread
    this.created_at = created_at || new Date()
    this.read_at = read_at
  }
}
